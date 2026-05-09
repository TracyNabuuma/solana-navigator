import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Code2, Users, Newspaper, Volume2, VolumeX } from "lucide-react";
import logo from "@/assets/tikvat-logo.png";
import { LANGUAGES, type LangCode } from "@/data/languages";
import { solanaKnowledge } from "@/data/solana-knowledge";
import { LanguageSelector } from "@/components/LanguageSelector";
import { QuestionInput } from "@/components/QuestionInput";
import { AnswerDisplay } from "@/components/AnswerDisplay";
import { NewsFeed } from "@/components/NewsFeed";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Tikvat — Solana Ecosystem Assistant" },
      { name: "description", content: "Ask anything about Solana — for builders and everyday users — in your language, with voice. Powered by AI and ElevenLabs." },
      { property: "og:title", content: "Tikvat — Solana Ecosystem Assistant" },
      { property: "og:description", content: "Multilingual Solana Q&A, code snippets, and live news. Voice narration in Luganda, Swahili, French and more." },
    ],
  }),
});

type Tab = "developer" | "consumer" | "news";

function Index() {
  const [tab, setTab] = useState<Tab>("consumer");
  const [lang, setLang] = useState<LangCode>("en");
  const [voice, setVoice] = useState(true);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setLang((localStorage.getItem("lang") as LangCode) || "en");
  }, []);
  useEffect(() => { localStorage.setItem("lang", lang); }, [lang]);

  const suggestions = useMemo(() => {
    if (tab === "developer") return solanaKnowledge.developer.map((d) => d.q);
    if (tab === "consumer") return solanaKnowledge.consumer.map((d) => d.q);
    return [];
  }, [tab]);

  const ask = async (q: string) => {
    setQuestion(q); setAnswer(""); setErr(null); setLoading(true);
    try {
      const pool = tab === "developer" ? solanaKnowledge.developer : solanaKnowledge.consumer;
      const context = pool
        .filter((p) => q.toLowerCase().split(/\W+/).some((w) => w.length > 3 && p.q.toLowerCase().includes(w)))
        .map((p) => `Q: ${p.q}\nA: ${p.a}`).join("\n\n");

      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, mode: tab === "developer" ? "developer" : "consumer", context }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { answer: english } = await res.json();

      let final = english;
      if (lang !== "en") {
        const tr = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: english, targetLang: lang }),
        });
        if (tr.ok) {
          const j = await tr.json();
          final = j.text;
        }
      }
      setAnswer(final);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Sidebar */}
      <aside className="lg:w-72 lg:min-h-screen border-b lg:border-b-0 lg:border-r border-sidebar-border bg-sidebar/80 backdrop-blur p-5 space-y-6">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Tikvat" className="h-10 w-auto" />
        </div>
        <div className="space-y-1">
          <h1 className="text-xl font-bold gradient-text">Solana Assistant</h1>
          <p className="text-xs text-muted-foreground">Build · Learn · Stay updated</p>
        </div>
        <LanguageSelector value={lang} onChange={setLang} />
        <div className="space-y-2">
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Output</div>
          <button
            onClick={() => setVoice((v) => !v)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-sidebar-accent text-sm hover:bg-sidebar-accent/70 transition"
          >
            {voice ? <Volume2 className="size-4 text-accent" /> : <VolumeX className="size-4" />}
            {voice ? "Text + Voice" : "Text only"}
          </button>
        </div>
        <div className="text-[10px] text-muted-foreground leading-relaxed pt-2 border-t border-sidebar-border">
          Voice powered by ElevenLabs · multilingual TTS & speech-to-text built in.
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-4 sm:p-8 grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 max-w-[1600px] mx-auto w-full">
        <section className="space-y-6 min-w-0">
          {/* Tabs */}
          <div className="glass rounded-xl p-1 inline-flex gap-1">
            {([
              { id: "consumer", label: "For Users", icon: Users },
              { id: "developer", label: "For Builders", icon: Code2 },
              { id: "news", label: "News", icon: Newspaper },
            ] as const).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium inline-flex items-center gap-2 transition ${
                  tab === id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="size-4" /> {label}
              </button>
            ))}
          </div>

          {tab === "news" ? (
            <NewsFeed />
          ) : (
            <>
              <div className="space-y-2">
                <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
                  {tab === "developer" ? (
                    <>Ship on <span className="gradient-text">Solana</span> faster.</>
                  ) : (
                    <>Your <span className="gradient-text">Solana</span> guide, in your language.</>
                  )}
                </h2>
                <p className="text-muted-foreground">
                  {tab === "developer"
                    ? "Code snippets, Anchor patterns, and program design — answered with context."
                    : "Wallets, staking, payments, and NFTs — explained simply, narrated aloud."}
                </p>
                <p className="text-xs text-muted-foreground">
                  Answering in <strong className="text-foreground">{LANGUAGES.find((l) => l.code === lang)?.native}</strong>
                  {voice ? " · with voice" : " · text only"}
                </p>
              </div>

              <QuestionInput onAsk={ask} loading={loading} suggestions={suggestions} />

              {err && (
                <div className="rounded-xl border border-destructive/40 bg-destructive/10 text-destructive p-4 text-sm">
                  {err}
                </div>
              )}

              <AnswerDisplay
                question={question}
                answer={answer}
                loading={loading}
                voiceEnabled={voice}
                lang={lang}
              />
            </>
          )}
        </section>

        <aside className="min-w-0 hidden xl:block">
          <NewsFeed />
        </aside>
      </main>
    </div>
  );
}
