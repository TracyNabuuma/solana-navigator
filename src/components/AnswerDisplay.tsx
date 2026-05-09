import { renderMarkdown } from "@/lib/markdown";
import { Loader2 } from "lucide-react";
import { VoicePlayer } from "./VoicePlayer";
import type { LangCode } from "@/data/languages";

interface Props {
  question: string;
  answer: string;
  loading: boolean;
  voiceEnabled: boolean;
  lang: LangCode;
}

export function AnswerDisplay({ question, answer, loading, voiceEnabled, lang }: Props) {
  if (loading) {
    return (
      <div className="glass rounded-2xl p-6 flex items-center gap-3 text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> Thinking, translating, narrating…
      </div>
    );
  }
  if (!answer) return null;
  return (
    <div className="glass rounded-2xl p-6 space-y-4">
      <div className="text-xs uppercase tracking-widest text-muted-foreground">You asked</div>
      <div className="text-foreground/90">{question}</div>
      <div className="h-px bg-border" />
      <div
        className="prose-answer text-foreground"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(answer) }}
      />
      {voiceEnabled && <VoicePlayer text={answer} lang={lang} />}
    </div>
  );
}
