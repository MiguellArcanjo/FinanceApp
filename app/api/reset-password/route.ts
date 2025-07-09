import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { token, currentPassword, newPassword } = await req.json();

  if (!token || !currentPassword || !newPassword) {
    return NextResponse.json({ error: "Dados incompletos." }, { status: 400 });
  }

  // Busca usuário pelo token
  const user = await prisma.user.findFirst({ where: { resetToken: token, resetTokenExpires: { gt: new Date() } } });
  if (!user) {
    return NextResponse.json({ error: "Token inválido ou expirado." }, { status: 400 });
  }

  // Verifica senha atual
  const passwordMatch = await bcrypt.compare(currentPassword, user.password);
  if (!passwordMatch) {
    return NextResponse.json({ error: "Senha atual incorreta." }, { status: 400 });
  }

  // Atualiza senha
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpires: null,
    },
  });

  return NextResponse.json({ success: true });
} 