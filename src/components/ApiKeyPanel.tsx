import { useEffect, useState } from "react";
import { Key, Check, X } from "lucide-react";

interface Props { value: string; onChange: (v: string) => void; }

export function ApiKeyPanel({ value, onChange }: Props) {
  const [draft, setDraft] = useState(value);
  const [editing, setEditing] = useState(!value);
  useEffect(() => setDraft(value), [value]);

  if (!editing && value) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
          <Key className="size-3.5" /> ElevenLabs
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sidebar-accent text-xs">
          <Check className="size-3.5 text-accent" />
          <span className="text-muted-foreground">Key saved · {value.slice(0, 4)}…{value.slice(-4)}</span>
          <button onClick={() => setEditing(true)} className="ml-auto text-accent hover:underline">Change</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
        <Key className="size-3.5" /> ElevenLabs API Key
      </div>
      <input
        type="password"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="sk_..."
        className="w-full text-xs px-3 py-2 rounded-lg bg-sidebar-accent border border-border outline-none focus:border-primary"
      />
      <div className="flex gap-2">
        <button
          onClick={() => { onChange(draft.trim()); setEditing(false); }}
          disabled={!draft.trim()}
          className="flex-1 text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-foreground disabled:opacity-50"
        >Save</button>
        {value && (
          <button onClick={() => setEditing(false)} className="text-xs px-2 py-1.5 rounded-lg border border-border">
            <X className="size-3.5" />
          </button>
        )}
      </div>
      <p className="text-[10px] text-muted-foreground leading-relaxed">
        Stored locally in your browser only. Get one at elevenlabs.io.
      </p>
    </div>
  );
}
