import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function getUserEmail(req: NextRequest) {
  const email = req.headers.get("x-user-email") || "";
  return email;
}

export async function DELETE(req: NextRequest) {
  const email = getUserEmail(req);
  if (!email) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });

  // Apagar transações
  await prisma.transaction.deleteMany({ where: { userId: user.id } });
  // Apagar metas
  await prisma.goal.deleteMany({ where: { userId: user.id } });
  // Apagar contas bancárias
  await prisma.bankAccount.deleteMany({ where: { userId: user.id } });
  // Apagar perfil (se houver tabela separada, ajuste aqui)
  // await prisma.profile.deleteMany({ where: { userId: user.id } });
  // Apagar notificações (se houver tabela separada, ajuste aqui)
  // await prisma.notification.deleteMany({ where: { userId: user.id } });

  return NextResponse.json({ success: true });
} 