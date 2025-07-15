import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }
  const token = authHeader.replace("Bearer ", "");
  try {
    // Substitua 'seu_jwt_secret' pela sua chave secreta real usada para assinar o JWT
    jwt.verify(token, process.env.JWT_SECRET!);
    return NextResponse.json({ valid: true });
  } catch (e) {
    return NextResponse.json({ valid: false }, { status: 401 });
  }
} 