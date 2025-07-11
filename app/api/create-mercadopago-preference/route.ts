import { NextRequest, NextResponse } from "next/server";

const PLANOS = {
  pro: {
    nome: "Profissional (anual)",
    valor: 0.01, // valor de teste
  },
  lite: {
    nome: "Lite (mensal)",
    valor: 0.01, // valor de teste
  }
};

export async function POST(req: NextRequest) {
  const { email, plano } = await req.json();
  const planoInfo = PLANOS[plano as keyof typeof PLANOS];
  if (!planoInfo) {
    return NextResponse.json({ error: "Plano inválido" }, { status: 400 });
  }
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        items: [
          {
            title: planoInfo.nome,
            quantity: 1,
            unit_price: Number(planoInfo.valor),
            currency_id: "BRL"
          }
        ],
        // payer removido para permitir pagamento como convidado
        back_urls: {
          success: `${baseUrl}/register?success=1&email=${email}`,
          failure: `${baseUrl}/register?canceled=1`,
          pending: `${baseUrl}/register?pending=1`,
        },
        auto_return: "approved"
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("Erro Mercado Pago:", data);
      return NextResponse.json({ error: data.message || "Erro ao criar preferência de pagamento" }, { status: 500 });
    }
    return NextResponse.json({ url: data.init_point });
  } catch (error) {
    console.error('Erro Mercado Pago:', error);
    return NextResponse.json({ error: "Erro ao criar preferência de pagamento" }, { status: 500 });
  }
}

// Instruções para configuração:
// 1. Defina MERCADOPAGO_ACCESS_TOKEN no seu .env.local com o token do Mercado Pago
// 2. Defina NEXT_PUBLIC_BASE_URL com a URL do seu site (ex: http://localhost:3000)
// 3. No painel do Mercado Pago, cadastre o webhook: {NEXT_PUBLIC_BASE_URL}/api/mercadopago-webhook
// 4. O sistema já está pronto para receber pagamentos e notificações 