import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function getUserEmail(req: NextRequest) {
  const email = req.headers.get("x-user-email") || "";
  return email;
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const email = getUserEmail(req);
  if (!email) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  const goal = await prisma.goal.findUnique({ where: { id: params.id, userId: user.id } });
  if (!goal) return NextResponse.json({ error: "Meta não encontrada" }, { status: 404 });
  return NextResponse.json({ goal });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const email = getUserEmail(req);
  if (!email) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  const data = await req.json();
  console.log("PUT GOAL BODY:", data);
  // Espera: { name, description, targetAmount, deadline }
  if (!data.name || data.targetAmount === undefined || data.targetAmount === null || isNaN(Number(data.targetAmount)) || !data.deadline) {
    return NextResponse.json({ error: "Dados incompletos ou inválidos" }, { status: 400 });
  }
  const goal = await prisma.goal.findUnique({ where: { id: params.id, userId: user.id } });
  if (!goal) return NextResponse.json({ error: "Meta não encontrada" }, { status: 404 });
  const updated = await prisma.goal.update({
    where: { id: params.id },
    data: {
      name: data.name,
      description: data.description,
      targetAmount: Number(data.targetAmount),
      deadline: new Date(data.deadline + 'T00:00:00'),
    },
  });
  return NextResponse.json({ goal: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const email = getUserEmail(req);
  if (!email) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  const goal = await prisma.goal.findUnique({ where: { id: params.id, userId: user.id } });
  if (!goal) return NextResponse.json({ error: "Meta não encontrada" }, { status: 404 });
  await prisma.goal.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
} 