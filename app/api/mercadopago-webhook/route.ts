import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { MercadoPagoConfig, Payment } from "mercadopago";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
const mp = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN! });

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Log para debug
  console.log("Webhook Mercado Pago recebido:", JSON.stringify(body));

  if (body.type === "payment" && body.data && body.data.id) {
    try {
      const payment = new Payment(mp);
      const paymentInfo = await payment.get({ id: body.data.id });
      if (paymentInfo.status === "approved") {
        // Extrair e-mail e nome do pagador
        const email = paymentInfo.payer?.email;
        const name = paymentInfo.payer?.first_name || "Usuário";
        if (!email) {
          console.log("Pagamento aprovado, mas e-mail não encontrado.");
          return NextResponse.json({ error: "E-mail não encontrado no pagamento." }, { status: 400 });
        }
        // Verifica se o usuário já existe
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (!existingUser) {
          // Gera uma senha temporária
          const tempPassword = Math.random().toString(36).slice(-8);
          const hashedPassword = await bcrypt.hash(tempPassword, 10);
          await prisma.user.create({
            data: {
              name,
              email,
              password: hashedPassword,
            },
          });
          // Aqui você pode enviar um e-mail para o usuário criar/alterar a senha, se desejar
          console.log(`Usuário criado: ${email}`);
        } else {
          console.log(`Usuário já existe: ${email}`);
        }
      }
    } catch (err) {
      console.error("Erro ao processar pagamento do Mercado Pago:", err);
      return NextResponse.json({ error: "Erro ao processar pagamento." }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
} 