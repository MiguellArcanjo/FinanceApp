import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function getUserEmail(req: NextRequest) {
  const email = req.headers.get("x-user-email") || "";
  return email;
}

export async function POST(req: NextRequest) {
  const email = getUserEmail(req);
  if (!email) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  const data = await req.json();
  // Espera: { name, description, targetAmount, deadline }
  if (!data.name || !data.description || !data.targetAmount || !data.deadline) {
    return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
  }
  const goal = await prisma.goal.create({
    data: {
      name: data.name,
      description: data.description,
      targetAmount: Number(data.targetAmount),
      currentAmount: 0,
      deadline: new Date(data.deadline),
      userId: user.id,
    },
  });
  return NextResponse.json({ goal });
}

export async function GET(req: NextRequest) {
  const email = getUserEmail(req);
  if (!email) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  const goals = await prisma.goal.findMany({
    where: { userId: user.id },
    orderBy: { deadline: "asc" },
  });
  return NextResponse.json({ goals });
}

export async function PATCH(req: NextRequest) {
  const email = getUserEmail(req);
  if (!email) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  const data = await req.json();
  // Espera: { id, amount }
  if (!data.id || typeof data.amount !== "number") {
    return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
  }
  const goal = await prisma.goal.findUnique({ where: { id: data.id, userId: user.id } });
  if (!goal) return NextResponse.json({ error: "Meta não encontrada" }, { status: 404 });
  const novoValor = Math.min(goal.currentAmount + data.amount, goal.targetAmount);
  const updated = await prisma.goal.update({
    where: { id: data.id },
    data: { currentAmount: novoValor },
  });
  return NextResponse.json({ goal: updated });
}

export async function PUT(req: NextRequest) {
  const email = getUserEmail(req);
  if (!email) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  const data = await req.json();
  // Espera: { id, name, description, targetAmount, deadline }
  if (!data.id || !data.name || !data.description || !data.targetAmount || !data.deadline) {
    return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
  }
  const goal = await prisma.goal.findUnique({ where: { id: data.id, userId: user.id } });
  if (!goal) return NextResponse.json({ error: "Meta não encontrada" }, { status: 404 });
  const updated = await prisma.goal.update({
    where: { id: data.id },
    data: {
      name: data.name,
      description: data.description,
      targetAmount: Number(data.targetAmount),
      deadline: new Date(data.deadline),
    },
  });
  return NextResponse.json({ goal: updated });
}

export async function DELETE(req: NextRequest) {
  const email = getUserEmail(req);
  if (!email) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  const data = await req.json();
  // Espera: { id }
  if (!data.id) {
    return NextResponse.json({ error: "ID não informado" }, { status: 400 });
  }
  const goal = await prisma.goal.findUnique({ where: { id: data.id, userId: user.id } });
  if (!goal) return NextResponse.json({ error: "Meta não encontrada" }, { status: 404 });
  await prisma.goal.delete({ where: { id: data.id } });
  return NextResponse.json({ success: true });
} 