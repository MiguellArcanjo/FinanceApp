import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Função utilitária para recalcular o saldo da conta
async function recalculateAccountBalance(accountId: string, prismaInstance: any) {
  const allTransactions = await prismaInstance.transaction.findMany({ where: { accountId } });
  const saldo = allTransactions.reduce((acc: number, t: { type: string; amount: number }) => t.type === 'income' ? acc + Number(t.amount) : acc - Number(t.amount), 0);
  await prismaInstance.bankAccount.update({ where: { id: accountId }, data: { balance: saldo } });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  if (!id) return NextResponse.json({ error: "ID não informado" }, { status: 400 });

  try {
    // Buscar a transação
    const transaction = await prisma.transaction.findUnique({ where: { id } });
    if (!transaction) return NextResponse.json({ error: "Transação não encontrada" }, { status: 404 });

    // Buscar a conta
    const account = await prisma.bankAccount.findUnique({ where: { id: transaction.accountId } });
    if (!account) return NextResponse.json({ error: "Conta não encontrada" }, { status: 404 });

    // Se for recorrente ou parcelado, buscar todas do grupo
    let transactionsToDelete = [transaction];
    if (transaction.recurrenceGroupId) {
      transactionsToDelete = await prisma.transaction.findMany({ where: { recurrenceGroupId: transaction.recurrenceGroupId } });
    } else if (transaction.installmentGroupId) {
      transactionsToDelete = await prisma.transaction.findMany({ where: { installmentGroupId: transaction.installmentGroupId } });
    }
    // Ajustar saldo para cada transação
    let novoSaldo = account.balance;
    for (const t of transactionsToDelete) {
      if (t.type === "income") novoSaldo -= Number(t.amount);
      else if (t.type === "expense") novoSaldo += Number(t.amount);
    }
    await prisma.bankAccount.update({ where: { id: account.id }, data: { balance: novoSaldo } });
    // Deletar todas as transações do grupo
    await prisma.transaction.deleteMany({ where: { id: { in: transactionsToDelete.map(t => t.id) } } });
    // Recalcular saldo da conta
    await recalculateAccountBalance(account.id, prisma);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Erro ao deletar transação" }, { status: 500 });
  }
} 