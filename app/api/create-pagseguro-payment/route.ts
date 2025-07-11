import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { name, email, plano } = await req.json();

  // Defina os valores dos planos
  const PLANOS = {
    pro: { nome: "Profissional (anual)", valor: 0.01 },
    lite: { nome: "Lite (mensal)", valor: 0.01 }
  };
  const planoInfo = PLANOS[plano as keyof typeof PLANOS];
  if (!planoInfo) {
    return NextResponse.json({ error: "Plano inválido" }, { status: 400 });
  }

  // Monta o body do PagSeguro
  const body = new URLSearchParams({
    email: process.env.PAGSEGURO_EMAIL!,
    token: process.env.PAGSEGURO_TOKEN!,
    currency: "BRL",
    itemId1: "1",
    itemDescription1: planoInfo.nome,
    itemAmount1: planoInfo.valor.toFixed(2),
    itemQuantity1: "1",
    senderName: name,
    senderEmail: email,
  });

  try {
    const response = await fetch("https://sandbox.pagseguro.uol.com.br/v2/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });

    const xml = await response.text();
    console.log('Resposta PagSeguro XML:', xml); // Log para debug
    // Extraia o code do XML de resposta
    const codeMatch = xml.match(/<code>(.*?)<\/code>/);
    if (!codeMatch) {
      return NextResponse.json({ error: "Erro ao criar pagamento PagSeguro" }, { status: 500 });
    }
    const code = codeMatch[1];
    // URL para redirecionar o usuário (sandbox)
    const url = `https://sandbox.pagseguro.uol.com.br/v2/checkout/payment.html?code=${code}`;
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Erro PagSeguro:", error);
    return NextResponse.json({ error: "Erro ao criar pagamento PagSeguro" }, { status: 500 });
  }
} 