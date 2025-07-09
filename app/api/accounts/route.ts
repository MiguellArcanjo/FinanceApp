import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function getUserEmail(req: NextRequest) {
  const email = req.headers.get("x-user-email") || "";
  return email;
}

export async function GET(req: NextRequest) {
  const email = getUserEmail(req);
  if (!email) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  const accounts = await prisma.bankAccount.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ accounts });
}

export async function POST(req: NextRequest) {
  const email = getUserEmail(req);
  if (!email) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  const data = await req.json();
  console.log('data recebido no backend:', data)
  // Espera: { name, bank, type, balance }
  if (!data.name || !data.bank || !data.type) {
    return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
  }
  const account = await prisma.bankAccount.create({
    data: {
      name: data.name,
      bank: data.bank,
      type: data.type,
      balance: Number(data.balance) || 0,
      userId: user.id,
    },
  });
  return NextResponse.json({ account });
} 