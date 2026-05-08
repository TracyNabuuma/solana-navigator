import { useState } from "react";
import { Play, Pause, Loader2, Volume2, AlertCircle } from "lucide-react";
import { synthesizeSpeech } from "@/lib/elevenlabs";
import type { LangCode } from "@/data/languages";

interface Props { text: string; lang: LangCode; apiKey: string; }

export function VoicePlayer({ text, lang, apiKey }: Props) {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = async () => {
    setError(null);
    if (audio) {
      if (playing) { audio.pause(); setPlaying(false); }
      else { audio.play(); setPlaying(true); }
      return;
    }
    if (!apiKey) {
      setError("Add your ElevenLabs API key in the sidebar to enable voice.");
      return;
    }
    setLoading(true);
    try {
      // Strip markdown for cleaner speech
      const speakable = text.replace(/```[\s\S]*?```/g, "").replace(/[`*#_>]/g, "");
      const blob = await synthesizeSpeech({ text: speakable, apiKey, lang });
      const url = URL.createObjectURL(blob);
      const a = new Audio(url);
      a.onended = () => setPlaying(false);
      setAudio(a);
      a.play();
      setPlaying(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Voice synthesis failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 pt-2 border-t border-border">
      <button
        onClick={toggle}
        disabled={loading}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/20 hover:bg-accent/30 text-accent border border-accent/40 text-sm transition"
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : playing ? <Pause className="size-4" /> : <Play className="size-4" />}
        {loading ? "Generating voice…" : playing ? "Pause" : "Listen"}
      </button>
      <Volume2 className="size-4 text-muted-foreground" />
      <span className="text-xs text-muted-foreground uppercase tracking-wider">{lang}</span>
      {error && (
        <span className="text-xs text-destructive inline-flex items-center gap-1">
          <AlertCircle className="size-3" /> {error}
        </span>
      )}
    </div>
  );
}
