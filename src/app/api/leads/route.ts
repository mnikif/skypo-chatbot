import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { clientId, name, phone, summary, chat_history } = body as {
    clientId: string;
    name: string;
    phone: string;
    summary?: string;
    chat_history?: { role: string; content: string }[];
  };

  if (!clientId || !name || !phone) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const { error } = await supabase.from("leads").insert({
    client_id: clientId,
    name,
    phone,
    summary: summary ?? null,
    chat_history: chat_history ?? null,
  });

  if (error) {
    console.error("Supabase insert error:", error);
    return NextResponse.json({ error: "Failed to save lead" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
