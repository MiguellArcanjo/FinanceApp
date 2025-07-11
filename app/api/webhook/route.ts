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
            text: "Seu pagamento foi aprovado com sucesso. Agora você pode acessar sua conta.",
            html: `<b>Seu pagamento foi aprovado com sucesso!</b><br/>Acesse sua conta em <a href='http://localhost:3000/login'>http://localhost:3000/login</a>`
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

  return NextResponse.json({ received: true });
} 