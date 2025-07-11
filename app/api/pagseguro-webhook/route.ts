import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.text(); // PagSeguro envia como x-www-form-urlencoded
  console.log("Webhook PagSeguro recebido:", body);
  // Aqui você pode processar o body, consultar o status do pagamento, ativar usuário, etc.
  return NextResponse.json({ received: true });
} 