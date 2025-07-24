import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

// const PRICE_ID_MENSAL = "price_1RlA0yHpX8U2cDcH2apsCTvd"; // Preço teste: 0,01
const PRICE_ID_MENSAL = "price_1RlCuzHpX8U2cDcHsdnG9vK8"; // Preço Real
const PRICE_ID_ANUAL = "price_1RlA6lHpX8U2cDcHsV7u3eTH";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, plano } = await req.json();
    let priceId = PRICE_ID_MENSAL;
    if (plano === "anual") priceId = PRICE_ID_ANUAL;
    // padrão: mensal
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer_email: email,
      success_url: "https://www.organizze.space/login", // Troque para sua URL real
      cancel_url: "https://www.organizze.space/register", // Troque para sua URL real
      metadata: {
        name,
        email,
        password,
      },
    });
    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
} 