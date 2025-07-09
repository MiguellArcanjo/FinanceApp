import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function getUserEmail(req: NextRequest) {
  const email = req.headers.get("x-user-email") || "";
  return email;
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const email = getUserEmail(req);
  if (!email) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  const { id } = params;
  const data = await req.json();
  if (!data.name || !data.bank || !data.type) {
    return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
  }
  const updated = await prisma.bankAccount.update({
    where: { id, userId: user.id },
    data: {
      name: data.name,
      bank: data.bank,
      type: data.type,
      balance: Number(data.balance) || 0,
    },
  });
  return NextResponse.json({ account: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const email = getUserEmail(req);
  if (!email) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  const { id } = params;
  try {
    await prisma.bankAccount.delete({ where: { id, userId: user.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao excluir conta." }, { status: 400 });
  }
} 