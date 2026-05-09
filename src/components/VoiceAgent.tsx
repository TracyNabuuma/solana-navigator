import { useConversation } from "@elevenlabs/react";
import { useCallback, useEffect, useState } from "react";
import { Mic, MicOff, Loader2, Settings2, Sparkles } from "lucide-react";

const STORAGE_KEY = "elevenlabs_agent_id";

export function VoiceAgent() {
  const [agentId, setAgentId] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [transcript, setTranscript] = useState<
    { role: "user" | "agent"; text: string }[]
  >([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) || "";
    setAgentId(saved);
    if (!saved) setShowSettings(true);
  }, []);

  const conversation = useConversation({
    onConnect: () => console.log("[agent] connected"),
    onDisconnect: () => console.log("[agent] disconnected"),
    onError: (e) => console.error("[agent] error", e),
    onMessage: (msg: { source?: string; message?: string }) => {
      if (msg?.message) {
        setTranscript((t) => [
          ...t,
          { role: msg.source === "user" ? "user" : "agent", text: msg.message! },
        ]);
      }
    },
  });

  const status = conversation.status;
  const isActive = status === "connected";
  const isSpeaking = conversation.isSpeaking;

  const start = useCallback(async () => {
    if (!agentId) {
      setShowSettings(true);
      return;
    }
    setConnecting(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({
        agentId,
        connectionType: "webrtc",
      });
    } catch (e) {
      console.error(e);
      alert(
        "Couldn't start the agent. Make sure mic access is allowed and the Agent ID is valid & set to public.",
      );
    } finally {
      setConnecting(false);
    }
  }, [agentId, conversation]);

  const stop = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  const saveId = (v: string) => {
    setAgentId(v);
    localStorage.setItem(STORAGE_KEY, v);
  };

  return (
    <div className="glass rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-accent" />
          <h3 className="text-sm font-semibold uppercase tracking-widest">
            Solana Voice Agent
          </h3>
        </div>
        <button
          onClick={() => setShowSettings((s) => !s)}
          className="text-muted-foreground hover:text-foreground transition"
          aria-label="Settings"
        >
          <Settings2 className="size-4" />
        </button>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        A live, conversational Solana assistant. It can pull from the Solana
        ecosystem docs & news you attach in ElevenLabs and help you weigh
        options against your requirements — out loud.
      </p>

      {showSettings && (
        <div className="space-y-2 p-3 rounded-lg bg-card/60 border border-border">
          <label className="text-xs text-muted-foreground">
            ElevenLabs Agent ID
          </label>
          <input
            value={agentId}
            onChange={(e) => saveId(e.target.value.trim())}
            placeholder="agent_xxxxxxxxxxxxxxxxxxxx"
            className="w-full px-3 py-2 rounded-md bg-background border border-border text-sm font-mono"
          />
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Create the agent at elevenlabs.io → Conversational AI. Attach a
            knowledge base of Solana docs (solana.com/docs, anchor-lang.com,
            jup.ag/docs, etc.) and news sources. Set the agent to{" "}
            <strong>Public</strong>. Paste the ID here.
          </p>
        </div>
      )}

      <div className="flex items-center gap-3">
        {!isActive ? (
          <button
            onClick={start}
            disabled={connecting || !agentId}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {connecting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Mic className="size-4" />
            )}
            {connecting ? "Connecting…" : "Start voice chat"}
          </button>
        ) : (
          <button
            onClick={stop}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-destructive text-destructive-foreground font-medium hover:opacity-90 transition"
          >
            <MicOff className="size-4" /> End conversation
          </button>
        )}
      </div>

      {isActive && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span
            className={`size-2 rounded-full ${
              isSpeaking ? "bg-accent animate-pulse" : "bg-emerald-500"
            }`}
          />
          {isSpeaking ? "Agent speaking…" : "Listening…"}
        </div>
      )}

      {transcript.length > 0 && (
        <div className="max-h-56 overflow-y-auto space-y-2 pt-2 border-t border-border">
          {transcript.slice(-12).map((m, i) => (
            <div key={i} className="text-xs">
              <span
                className={`font-semibold mr-2 ${
                  m.role === "user" ? "text-foreground" : "text-accent"
                }`}
              >
                {m.role === "user" ? "You" : "Agent"}:
              </span>
              <span className="text-muted-foreground">{m.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
