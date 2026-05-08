// Frontend-only ElevenLabs TTS. Translation is done client-side via the
// Lovable AI server route; ElevenLabs handles voice synthesis here.
export const ELEVEN_VOICES: Record<string, string> = {
  en: "EXAVITQu4vr4xnSDxMaL", // Sarah
  fr: "XrExE9yKIg1WjnnlVkGX", // Matilda (multilingual)
  es: "FGY2WhTYpPnrIDTdsKH5",
  sw: "EXAVITQu4vr4xnSDxMaL",
  lg: "EXAVITQu4vr4xnSDxMaL",
  pt: "FGY2WhTYpPnrIDTdsKH5",
  de: "JBFqnCBsd6RMkjVDRZzb",
};

export async function synthesizeSpeech(opts: {
  text: string;
  apiKey: string;
  voiceId?: string;
  lang?: string;
}): Promise<Blob> {
  const voiceId = opts.voiceId || ELEVEN_VOICES[opts.lang || "en"] || ELEVEN_VOICES.en;
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "xi-api-key": opts.apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: opts.text,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    },
  );
  if (!res.ok) {
    throw new Error(`ElevenLabs ${res.status}: ${await res.text().catch(() => "")}`);
  }
  return res.blob();
}
