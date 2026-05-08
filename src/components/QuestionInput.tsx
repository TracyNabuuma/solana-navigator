import { useState } from "react";
import { Send, Sparkles } from "lucide-react";

interface Props {
  onAsk: (q: string) => void;
  loading: boolean;
  suggestions?: string[];
}

export function QuestionInput({ onAsk, loading, suggestions = [] }: Props) {
  const [value, setValue] = useState("");

  const submit = (q: string) => {
    if (!q.trim() || loading) return;
    onAsk(q.trim());
    setValue("");
  };

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
          placeholder="Ask anything about Solana — building, staking, payments…"
          rows={2}
          className="flex-1 bg-transparent resize-none outline-none px-3 py-2 text-foreground placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="h-11 px-4 rounded-xl bg-primary text-primary-foreground font-medium inline-flex items-center gap-2 disabled:opacity-50 hover:opacity-90 transition"
        >
          {loading ? <Sparkles className="size-4 animate-pulse" /> : <Send className="size-4" />}
          Ask
        </button>
      </form>
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
