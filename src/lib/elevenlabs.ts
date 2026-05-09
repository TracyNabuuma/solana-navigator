// Frontend-only ElevenLabs integration. Key is embedded per user request.
// NOTE: This exposes the key to anyone using the site. Rotate if abused.
export const ELEVENLABS_API_KEY =
  "sk_f33a6d7a4370b18ef28b1a5ba1dfcbb4d02dc91857a7977b";

export const ELEVEN_VOICES: Record<string, string> = {
  en: "EXAVITQu4vr4xnSDxMaL",
  fr: "XrExE9yKIg1WjnnlVkGX",
  es: "FGY2WhTYpPnrIDTdsKH5",
  sw: "EXAVITQu4vr4xnSDxMaL",
  lg: "EXAVITQu4vr4xnSDxMaL",
  pt: "FGY2WhTYpPnrIDTdsKH5",
  de: "JBFqnCBsd6RMkjVDRZzb",
};

export async function synthesizeSpeech(opts: {
  text: string;
  voiceId?: string;
  lang?: string;
  apiKey?: string;
}): Promise<Blob> {
  const voiceId = opts.voiceId || ELEVEN_VOICES[opts.lang || "en"] || ELEVEN_VOICES.en;
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
    {
      method: "POST",
      headers: {
        "xi-api-key": opts.apiKey || ELEVENLABS_API_KEY,
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

// Batch speech-to-text using scribe_v2.
export async function transcribeAudio(audio: Blob, languageCode?: string): Promise<string> {
  const fd = new FormData();
  fd.append("file", audio, "question.webm");
  fd.append("model_id", "scribe_v2");
  if (languageCode) fd.append("language_code", languageCode);
  const res = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
    method: "POST",
    headers: { "xi-api-key": ELEVENLABS_API_KEY },
    body: fd,
  });
  if (!res.ok) {
    throw new Error(`STT ${res.status}: ${await res.text().catch(() => "")}`);
  }
  const data = (await res.json()) as { text?: string };
  return data.text || "";
}
