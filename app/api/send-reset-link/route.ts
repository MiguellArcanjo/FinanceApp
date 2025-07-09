import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import nodemailer from "nodemailer";
import crypto from "crypto";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email) {
    return NextResponse.json({ error: "E-mail é obrigatório" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  // Gera token seguro
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

  await prisma.user.update({
    where: { email },
    data: {
      resetToken: token,
      resetTokenExpires: expires,
    },
  });

  // Monta o link de reset
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const resetLink = `${baseUrl}/reset-password?token=${token}`;

  // Configuração do Nodemailer
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Envia o e-mail
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Redefinição de senha - FinanceControl",
    html: `
      <div style="max-width:420px;margin:40px auto;padding:24px;background:#fff;border-radius:16px;box-shadow:0 2px 8px #0001;font-family:sans-serif;border:2px solid #1a237e;">
        <h2 style="color:#1a237e;margin-bottom:8px;">Redefinição de senha</h2>
        <hr style="border:none;border-top:1px solid #eee;margin:8px 0 16px 0;" />
        <p>Olá, <b>${user.name}</b>!</p>
        <p>Recebemos uma solicitação para redefinir a senha da sua conta FinanceControl.</p>
        <p>Para criar uma nova senha, clique no botão abaixo:</p>
        <div style="text-align:center;margin:32px 0 16px 0;">
          <a href="${resetLink}" style="display:inline-block;padding:12px 32px;background:#1a237e;color:#fff;border-radius:8px;text-decoration:none;font-weight:bold;font-size:1.1rem;">Redefinir senha</a>
        </div>
        <p style="color:#888;font-size:14px;margin-top:24px;">Se você não solicitou a redefinição, ignore este e-mail.</p>
      </div>
    `,
  });

  return NextResponse.json({ success: true });
} 