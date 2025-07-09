import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { email, code } = await req.json();

  if (!email || !code) {
    return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !user.verificationCode || !user.verificationExpires) {
    return NextResponse.json({ error: "Código inválido" }, { status: 400 });
  }

  if (user.verificationCode !== code) {
    return NextResponse.json({ error: "Código incorreto" }, { status: 400 });
  }

  if (user.verificationExpires < new Date()) {
    return NextResponse.json({ error: "Código expirado" }, { status: 400 });
  }

  // Código válido! Limpar campos de verificação
  await prisma.user.update({
    where: { email },
    data: {
      verificationCode: null,
      verificationExpires: null,
    },
  });

  return NextResponse.json({ success: true });
} 