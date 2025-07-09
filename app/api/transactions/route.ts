import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Simulação: pegar email do usuário do body/query (em produção, use autenticação real)
function getUserEmail(req: NextRequest) {
  const email = req.headers.get("x-user-email") || "";
  return email;
}

// Função utilitária para recalcular o saldo da conta
async function recalculateAccountBalance(accountId: string) {
  const allTransactions = await prisma.transaction.findMany({ where: { accountId } });
  const saldo = allTransactions.reduce((acc, t) => t.type === 'income' ? acc + Number(t.amount) : acc - Number(t.amount), 0);
  await prisma.bankAccount.update({ where: { id: accountId }, data: { balance: saldo } });
}

export async function GET(req: NextRequest) {
  const email = getUserEmail(req);
  if (!email) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  const transactions = await prisma.transaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ transactions });
}

export async function POST(req: NextRequest) {
  const email = getUserEmail(req);
  if (!email) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  const data = await req.json();
  // Espera: { type, description, amount, date, category, account, isInstallment, installments }
  if (!data.type || !data.description || !data.amount || !data.date || !data.category || !data.accountId) {
    return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
  }
  // Atualizar saldo da conta
  const account = await prisma.bankAccount.findUnique({ where: { id: data.accountId, userId: user.id } });
  if (!account) {
    return NextResponse.json({ error: "Conta não encontrada" }, { status: 404 });
  }

  // Parcelado
  if (data.type === "expense" && data.isInstallment && data.installments > 1) {
    let novoSaldo = account.balance;
    const [year, month, day] = data.date.split('-').map(Number);
    const transactions = [];
    for (let i = 0; i < data.installments; i++) {
      const parcelaDate = new Date(year, month - 1 + i, day, 12, 0, 0);
      novoSaldo -= Number(data.amount);
      const transaction = await prisma.transaction.create({
        data: {
          type: data.type,
          description: `${data.description} (${i + 1}/${data.installments})`,
          amount: Number(data.amount),
          date: parcelaDate,
          category: data.category,
          userId: user.id,
          accountId: account.id,
        },
      });
      transactions.push(transaction);
    }
    await recalculateAccountBalance(account.id);
    return NextResponse.json({ transactions });
  }

  // Recorrente
  if (data.type === "expense" && data.isRecurring && data.recurrenceGroupId) {
    let novoSaldo = account.balance;
    const [year, month, day] = data.date.split('-').map(Number);
    const transactions = [];
    for (let i = 0; i < 6; i++) {
      const recDate = new Date(year, month - 1 + i, day, 12, 0, 0);
      // Só desconta do saldo se for o mês atual
      if (i === 0) novoSaldo -= Number(data.amount);
      const transaction = await prisma.transaction.create({
        data: {
          type: data.type,
          description: data.description,
          amount: Number(data.amount),
          date: recDate,
          category: data.category,
          userId: user.id,
          accountId: account.id,
          recurrenceGroupId: data.recurrenceGroupId as string,
        },
      });
      transactions.push(transaction);
    }
    await recalculateAccountBalance(account.id);
    return NextResponse.json({ transactions });
  }

  // Não parcelado (ou receita)
  let novoSaldo = account.balance;
  if (data.type === "income") {
    novoSaldo += Number(data.amount);
  } else if (data.type === "expense") {
    novoSaldo -= Number(data.amount);
  }
  await recalculateAccountBalance(account.id);
  const [year, month, day] = data.date.split('-').map(Number);
  const date = new Date(year, month - 1, day, 12, 0, 0);
  const transaction = await prisma.transaction.create({
    data: {
      type: data.type,
      description: data.description,
      amount: Number(data.amount),
      date: date,
      category: data.category, // agora salva o nome da categoria
      userId: user.id,
      accountId: account.id,
    },
  });
  await recalculateAccountBalance(account.id);
  return NextResponse.json({ transaction });
}

export async function PUT(req: NextRequest) {
  const email = getUserEmail(req);
  if (!email) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  const data = await req.json();
  // Espera: { id, type, description, amount, date, category, accountId }
  if (!data.id || !data.type || !data.description || !data.amount || !data.date || !data.category || !data.accountId) {
    return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
  }
  // Buscar transação original
  const original = await prisma.transaction.findUnique({ where: { id: data.id, userId: user.id } });
  if (!original) return NextResponse.json({ error: "Transação não encontrada" }, { status: 404 });
  // Buscar conta
  const account = await prisma.bankAccount.findUnique({ where: { id: data.accountId, userId: user.id } });
  if (!account) return NextResponse.json({ error: "Conta não encontrada" }, { status: 404 });
  // Reverter saldo anterior
  let saldo = account.balance;
  if (original.type === "income") {
    saldo -= Number(original.amount);
  } else if (original.type === "expense") {
    saldo += Number(original.amount);
  }
  // Aplicar novo saldo
  if (data.type === "income") {
    saldo += Number(data.amount);
  } else if (data.type === "expense") {
    saldo -= Number(data.amount);
  }
  await recalculateAccountBalance(account.id);
  // No PUT
  const [year2, month2, day2] = data.date.split('-').map(Number);
  const date2 = new Date(year2, month2 - 1, day2, 12, 0, 0);
  const transaction = await prisma.transaction.update({
    where: { id: data.id },
    data: {
      type: data.type,
      description: data.description,
      amount: Number(data.amount),
      date: date2,
      category: data.category,
      accountId: account.id,
    },
  });
  await recalculateAccountBalance(account.id);
  return NextResponse.json({ transaction });
} 