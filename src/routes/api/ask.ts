import { createFileRoute } from "@tanstack/react-router";
import "@tanstack/react-start";
import { generateText } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway";

type Body = { question?: string; mode?: "developer" | "consumer"; context?: string };

export const Route = createFileRoute("/api/ask")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const { question, mode = "consumer", context = "" } = (await request.json()) as Body;
        if (!question) return new Response("question required", { status: 400 });

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-3-flash-preview");

        const system =
          mode === "developer"
            ? "You are a senior Solana developer assistant. Answer with concise, accurate technical guidance. Use markdown and fenced code blocks (rust, ts, bash) where helpful. Prefer Anchor and @solana/web3.js. Keep answers under 250 words."
            : "You are a friendly Solana onboarding guide for everyday users. Explain wallets, staking, payments, and NFTs in plain language. Avoid jargon. Use short markdown bullets. Keep answers under 200 words.";

        const prompt = context
          ? `Reference notes:\n${context}\n\nUser question: ${question}`
          : question;

        try {
          const { text } = await generateText({ model, system, prompt });
          return Response.json({ answer: text });
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : "AI error";
          return new Response(msg, { status: 500 });
        }
      },
    },
  },
});
