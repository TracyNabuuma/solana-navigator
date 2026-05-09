import { useRef, useState } from "react";
import { Send, Sparkles, Mic, Square, Loader2 } from "lucide-react";
import { transcribeAudio } from "@/lib/elevenlabs";

interface Props {
  onAsk: (q: string) => void;
  loading: boolean;
  suggestions?: string[];
}

export function QuestionInput({ onAsk, loading, suggestions = [] }: Props) {
  const [value, setValue] = useState("");
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const submit = (q: string) => {
    if (!q.trim() || loading) return;
    onAsk(q.trim());
    setValue("");
  };

  const startRecording = async () => {
    setMicError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
        setTranscribing(true);
        try {
          const text = await transcribeAudio(blob);
          if (text.trim()) {
            setValue(text);
            onAsk(text.trim());
            setValue("");
          } else {
            setMicError("Didn't catch that. Try again.");
          }
        } catch (e) {
          setMicError(e instanceof Error ? e.message : "Transcription failed.");
        } finally {
          setTranscribing(false);
        }
      };
      rec.start();
      recorderRef.current = rec;
      setRecording(true);
    } catch (e) {
      setMicError(e instanceof Error ? e.message : "Microphone access denied.");
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    setRecording(false);
  };

  const micBusy = transcribing || loading;

  return (
    <div className="space-y-3">
      <form
        onSubmit={(e) => { e.preventDefault(); submit(value); }}
        className="glass rounded-2xl p-2 flex items-end gap-2 shadow-2xl"
      >
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(value); }
          }}
          placeholder={recording ? "Listening… speak your question" : "Ask anything about Solana — type or tap the mic"}
          rows={2}
          className="flex-1 bg-transparent resize-none outline-none px-3 py-2 text-foreground placeholder:text-muted-foreground"
        />
        <button
          type="button"
          onClick={recording ? stopRecording : startRecording}
          disabled={micBusy}
          title={recording ? "Stop recording" : "Ask with your voice"}
          className={`h-11 w-11 rounded-xl inline-flex items-center justify-center transition border ${
            recording
              ? "bg-destructive/20 border-destructive/50 text-destructive animate-pulse"
              : "bg-accent/15 border-accent/40 text-accent hover:bg-accent/25"
          } disabled:opacity-50`}
        >
          {transcribing ? <Loader2 className="size-4 animate-spin" /> : recording ? <Square className="size-4" /> : <Mic className="size-4" />}
        </button>
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="h-11 px-4 rounded-xl bg-primary text-primary-foreground font-medium inline-flex items-center gap-2 disabled:opacity-50 hover:opacity-90 transition"
        >
          {loading ? <Sparkles className="size-4 animate-pulse" /> : <Send className="size-4" />}
          Ask
        </button>
      </form>
      {micError && <p className="text-xs text-destructive">{micError}</p>}
      {transcribing && <p className="text-xs text-muted-foreground">Transcribing your question…</p>}
      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => submit(s)}
              disabled={loading}
              className="text-xs px-3 py-1.5 rounded-full border border-border bg-card/50 hover:bg-card text-muted-foreground hover:text-foreground transition"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
