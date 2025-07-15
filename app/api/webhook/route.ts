import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import nodemailer from "nodemailer";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Configuração do Nodemailer para Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig!, endpointSecret);
  } catch (err: any) {
    console.error("Erro no webhook:", err.message);
    return NextResponse.json({ error: "Webhook signature failed" }, { status: 400 });
  }

  console.log("Evento recebido:", event.type);

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      // Use o email do metadata se existir, senão o customer_email
      const email = session.metadata?.email || session.customer_email;
      const { name, password } = session.metadata || {};
      console.log("Metadata recebido:", session.metadata);
      if (email && name && password) {
        try {
          const hashedPassword = await bcrypt.hash(password, 10);
          const user = await prisma.user.create({
            data: {
              name,
              email,
              password: hashedPassword,
            },
          });
          console.log("Usuário criado:", user);
        } catch (dbErr: any) {
          if (dbErr.code === 'P2002') {
            // Usuário já existe
            console.log("Usuário já existe:", email);
          } else {
            console.error("Erro ao criar usuário:", dbErr);
          }
        }
      } else {
        console.warn("Dados insuficientes para criar usuário:", { email, name, password });
      }
      // Envia o e-mail normalmente
      if (email) {
        try {
          await transporter.sendMail({
            from: `"Financeiro" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: "Pagamento aprovado!",
            html: `
              <div style="max-width:440px;margin:40px auto;padding:32px 28px;background:#fff;border-radius:18px;box-shadow:0 4px 24px #0002;font-family:sans-serif;border:2px solid #2563eb;">
                <h2 style="color:#2563eb;margin-bottom:8px;font-size:1.4rem;font-weight:700;">Pagamento aprovado com sucesso!</h2>
                <hr style="border:none;border-top:1px solid #e0e7ef;margin:8px 0 18px 0;" />
                <p style="font-size:1.08rem;color:#334155;">Olá, <b>${name || email}</b>! Seu pagamento foi aprovado e sua conta está ativa.</p>
                <p style="color:#64748b;font-size:15px;margin:10px 0 22px 0;">Agora você pode acessar o sistema e aproveitar todos os recursos do Organizze.</p>
                <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/login" style="display:block;text-align:center;margin:32px 0 0 0;">
                  <span style="display:inline-block;padding:14px 38px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:1.1rem;box-shadow:0 2px 8px #2563eb22;transition:background 0.2s;">Acessar minha conta</span>
                </a>
                <p style="color:#64748b;font-size:13px;margin-top:28px;text-align:center;">Se você não reconhece este pagamento, entre em contato com nosso suporte.<br/>Obrigado por escolher o Organizze!</p>
              </div>
            `
          });
          console.log("E-mail de confirmação enviado para:", email);
        } catch (mailErr) {
          console.error("Erro ao enviar e-mail:", mailErr);
        }
      }
      break;
    }
    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      console.log("Fatura paga:", invoice.id);
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      console.log("Assinatura cancelada:", subscription.id);
      break;
    }
    default:
      console.log(`Evento não tratado: ${event.type}`);
  }

  // Envio de e-mail para erro de pagamento
  if (event.type === "checkout.session.async_payment_failed" || event.type === "payment_intent.payment_failed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = session.metadata?.email || session.customer_email;
    const { name } = session.metadata || {};
    if (email) {
      try {
        await transporter.sendMail({
          from: `"Financeiro" <${process.env.GMAIL_USER}>`,
          to: email,
          subject: "Erro no pagamento - ação necessária",
          html: `
            <div style="max-width:440px;margin:40px auto;padding:32px 28px;background:#fff;border-radius:18px;box-shadow:0 4px 24px #0002;font-family:sans-serif;border:2px solid #dc2626;">
              <h2 style="color:#dc2626;margin-bottom:8px;font-size:1.4rem;font-weight:700;">Houve um erro no seu pagamento</h2>
              <hr style="border:none;border-top:1px solid #e0e7ef;margin:8px 0 18px 0;" />
              <p style="font-size:1.08rem;color:#334155;">Olá, <b>${name || email}</b>! Não foi possível processar seu pagamento.</p>
              <p style="color:#64748b;font-size:15px;margin:10px 0 22px 0;">Clique no botão abaixo para tentar novamente e garantir o acesso ao sistema.</p>
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/register" style="display:block;text-align:center;margin:32px 0 0 0;">
                <span style="display:inline-block;padding:14px 38px;background:#dc2626;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:1.1rem;box-shadow:0 2px 8px #dc262622;transition:background 0.2s;">Tentar novamente</span>
              </a>
              <p style="color:#64748b;font-size:13px;margin-top:28px;text-align:center;">Se você não reconhece esta tentativa de pagamento, entre em contato com nosso suporte.<br/>Obrigado por escolher o Organizze!</p>
            </div>
          `
        });
        console.log("E-mail de erro de pagamento enviado para:", email);
      } catch (mailErr) {
        console.error("Erro ao enviar e-mail de erro de pagamento:", mailErr);
      }
    }
  }

  return NextResponse.json({ received: true });
} 