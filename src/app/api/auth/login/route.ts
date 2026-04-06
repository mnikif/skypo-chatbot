import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { signSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { clientId, password } = body as { clientId?: string; password?: string };
  if (!clientId || !password) {
    return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
  }

  const raw = process.env.CLIENT_PASSWORDS;
  if (!raw) {
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  let map: Record<string, string>;
  try {
    map = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
  }

  if (map[clientId] !== password) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = signSession(clientId);
  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return NextResponse.json({ success: true });
}
