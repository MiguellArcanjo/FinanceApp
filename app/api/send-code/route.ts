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
    subject: "Seu código de verificação",
    text: `Seu código de verificação é: ${code}`,
    html: `
      <div style="max-width:420px;margin:40px auto;padding:24px;background:#fff;border-radius:16px;box-shadow:0 2px 8px #0001;font-family:sans-serif;border:2px solid #1a237e;">
        <h2 style="color:#1a237e;margin-bottom:8px;">Código de confirmação</h2>
        <hr style="border:none;border-top:1px solid #eee;margin:8px 0 16px 0;" />
        <p>Olá, <b>${userName}</b>! Que bom te ver por aqui!</p>
        <p>Use o código a seguir para entrar na sua conta FinanceControl.</p>
        <p style="color:#888;font-size:14px;margin-bottom:24px;">Se não foi você quem solicitou o código, não precisa se preocupar, basta ignorar o e-mail.</p>
        <div style="display:flex;justify-content:center;align-items:center;gap:8px;margin:32px 0 16px 0;">
          ${code.split('').map(digit => `<div style='border:2px solid #1a237e;border-radius:8px;width:40px;height:48px;display:flex;align-items:center;justify-content:center;font-size:2rem;font-weight:bold;color:#1a237e;background:#f5f7fa;'>${digit}</div>`).join('')}
        </div>
      </div>
    `,
  });

  return NextResponse.json({ success: true });
} 