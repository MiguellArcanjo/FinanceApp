import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "E-mail é obrigatório" }, { status: 400 });
  }

  // Gera um código de 6 dígitos
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // Define validade de 10 minutos
  const expires = new Date(Date.now() + 10 * 60 * 1000);

  // Busca o usuário para pegar o nome
  const user = await prisma.user.findUnique({ where: { email } });
  const userName = user?.name || email.split("@")[0];

  // Salva o código e expiração no usuário
  await prisma.user.update({
    where: { email },
    data: {
      verificationCode: code,
      verificationExpires: expires,
    },
  });

  // Configuração do Nodemailer (exemplo com Gmail)
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // Seu e-mail
      pass: process.env.EMAIL_PASS, // Sua senha ou app password
    },
  });

  // Envia o e-mail
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Confirme seu cadastro - Organizze FinanceControl",
    html: `
      <div style="max-width:440px;margin:40px auto;padding:32px 28px;background:#fff;border-radius:18px;box-shadow:0 4px 24px #0002;font-family:sans-serif;border:2px solid #2563eb;">
        <div style="text-align:center;margin-bottom:18px;">
          <span style="font-size:1.7rem;font-weight:700;color:#2563eb;letter-spacing:-1px;">Organizze</span>
        </div>
        <h2 style="color:#2563eb;margin-bottom:8px;font-size:1.4rem;font-weight:700;">Confirme seu cadastro</h2>
        <hr style="border:none;border-top:1px solid #e0e7ef;margin:8px 0 18px 0;" />
        <p style="font-size:1.08rem;color:#334155;">Olá, <b>${userName}</b>! Seja bem-vindo(a) ao <b>Organizze FinanceControl</b>!</p>
        <p style="color:#64748b;font-size:15px;margin:10px 0 22px 0;">Para ativar sua conta, utilize o código abaixo ou clique no botão para acessar o sistema e finalizar seu cadastro.</p>
        <div style="display:flex;justify-content:center;align-items:center;gap:10px;margin:32px 0 18px 0;">
          ${code.split('').map(digit => `<div style='border:2px solid #2563eb;border-radius:10px;width:44px;height:54px;display:flex;align-items:center;justify-content:center;font-size:2.1rem;font-weight:700;color:#2563eb;background:#f1f5fd;'>${digit}</div>`).join('')}
        </div>
        <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/verify-code" style="display:block;text-align:center;margin:24px 0 0 0;">
          <span style="display:inline-block;padding:14px 38px;background:#2563eb;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:1.1rem;box-shadow:0 2px 8px #2563eb22;transition:background 0.2s;">Acessar sistema</span>
        </a>
        <p style="color:#64748b;font-size:13px;margin-top:28px;text-align:center;">Se você não solicitou este código, apenas ignore este e-mail.<br/>Dúvidas? Fale com nosso suporte.</p>
      </div>
    `,
  });

  return NextResponse.json({ success: true });
} 