import { NextRequest, NextResponse } from "next/server";
import { anthropic } from "@/lib/anthropic";
import { supabase } from "@/lib/supabase";
import { getClient } from "@/lib/clients";

export const runtime = "nodejs";

type Message = {
  role: "user" | "assistant";
  content: string;
};

function buildSystemPrompt(clientId: string): string {
  const client = getClient(clientId);

  if (!client) {
    return "You are a helpful customer service assistant. Answer questions politely.";
  }

  return `You are a friendly customer service assistant for ${client.name}.

Your job is to help visitors on their website by answering questions about their services, hours, and pricing.

**Business Details:**
- Services: ${client.services.join(", ")}
- Hours: ${client.hours}
- Phone: ${client.phone}

**FAQs:**
${client.faqs.join("\n")}

**Lead Capture Instructions:**
If someone is interested in booking, getting a quote, or wants to be contacted — ask for their first name and phone number. Once you have both, thank them and let them know the team will reach out shortly. Include their name and phone clearly in your response using this exact format on its own line:
LEAD_CAPTURED: [name] | [phone]

Keep responses short and conversational. Do not make up information not listed above. If asked something you don't know, suggest they call ${client.phone}.`;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { messages, clientId } = body as { messages: Message[]; clientId: string };

  if (!messages || !clientId) {
    return NextResponse.json({ error: "Missing messages or clientId" }, { status: 400 });
  }

  const stream = await anthropic.messages.stream({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 512,
    system: buildSystemPrompt(clientId),
    messages,
  });

  const encoder = new TextEncoder();
  let fullResponse = "";

  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (
          chunk.type === "content_block_delta" &&
          chunk.delta.type === "text_delta"
        ) {
          fullResponse += chunk.delta.text;
          controller.enqueue(encoder.encode(chunk.delta.text));
        }
      }

      // Save lead BEFORE closing so Vercel doesn't kill the function early
      const match = fullResponse.match(/LEAD_CAPTURED:\s*(.+?)\s*\|\s*(.+)/);
      if (match) {
        const name = match[1].trim();
        const phone = match[2].trim();
        const chatHistory = [
          ...messages,
          { role: "assistant" as const, content: fullResponse },
        ];

        const summary = messages
          .filter((m) => m.role === "user")
          .map((m) => m.content)
          .join(" / ");

        await supabase.from("leads").insert({
          client_id: clientId,
          name,
          phone,
          summary,
          chat_history: chatHistory,
        });
      }

      controller.close();
    },
  });

  return new NextResponse(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "Access-Control-Allow-Origin": "*",
    },
  });
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
