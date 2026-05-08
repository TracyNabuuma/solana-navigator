import { LANGUAGES, type LangCode } from "@/data/languages";
import { Globe } from "lucide-react";

interface Props { value: LangCode; onChange: (l: LangCode) => void; }

export function LanguageSelector({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
        <Globe className="size-3.5" /> Language
      </div>
      <div className="grid grid-cols-1 gap-1">
        {LANGUAGES.map((l) => (
          <button
            key={l.code}
            onClick={() => onChange(l.code)}
            className={`text-left px-3 py-2 rounded-lg text-sm transition border ${
              value === l.code
                ? "bg-primary/20 border-primary/50 text-foreground"
                : "border-transparent hover:bg-sidebar-accent text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="font-medium">{l.native}</div>
            <div className="text-xs text-muted-foreground">{l.label}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
