import { createFileRoute } from "@tanstack/react-router";
import "@tanstack/react-start";
import { generateText } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway";

type Body = { text?: string; targetLang?: string };

export const Route = createFileRoute("/api/translate")({
  server: {
    handlers: {
      POST: async ({ request }: { request: Request }) => {
        const { text, targetLang } = (await request.json()) as Body;
        if (!text || !targetLang) return new Response("missing fields", { status: 400 });
        if (targetLang === "en") return Response.json({ text });

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-3-flash-preview");

        try {
          const { text: translated } = await generateText({
            model,
            system: `You are a professional translator. Translate the user's text into the target language code "${targetLang}". Preserve markdown formatting and code blocks exactly. Output only the translation, no commentary.`,
            prompt: text,
          });
          return Response.json({ text: translated });
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : "translate error";
          return new Response(msg, { status: 500 });
        }
      },
    },
  },
});
