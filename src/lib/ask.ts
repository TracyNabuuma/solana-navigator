import { solanaKnowledge } from "@/data/solana-knowledge";

export type Mode = "developer" | "consumer";

function score(q: string, candidate: string) {
  const tokens = q.toLowerCase().split(/\W+/).filter((w) => w.length > 3);
  const text = candidate.toLowerCase();
  return tokens.reduce((s, t) => (text.includes(t) ? s + 1 : s), 0);
}

export function answerLocally(question: string, mode: Mode): string {
  const pool = mode === "developer" ? solanaKnowledge.developer : solanaKnowledge.consumer;
  const ranked = pool
    .map((p) => ({ ...p, s: score(question, p.q + " " + p.a) }))
    .sort((a, b) => b.s - a.s);
  const best = ranked[0];
  if (best && best.s > 0) return best.a;
  // Fallback: return a curated overview
  if (mode === "developer") {
    return [
      "Here are starting points for building on Solana:",
      "",
      "- **CLI**: install with `sh -c \"$(curl -sSfL https://release.solana.com/stable/install)\"`",
      "- **Anchor**: `cargo install --git https://github.com/coral-xyz/anchor avm --locked`",
      "- **JS SDK**: `npm i @solana/web3.js @solana/spl-token`",
      "- **Devnet**: `solana config set --url devnet && solana airdrop 2`",
      "",
      "Try a more specific question (programs, tokens, RPC, wallets, Anchor accounts).",
    ].join("\n");
  }
  return [
    "Solana is a fast, low-fee blockchain. To get started:",
    "",
    "- Install a wallet (Phantom, Solflare, or Backpack)",
    "- **Save your seed phrase offline** and never share it",
    "- Buy SOL on an exchange and withdraw to your wallet",
    "- Explore staking, payments (Solana Pay), and NFTs",
    "",
    "Ask a more specific question — wallets, staking, fees, NFTs, or Solana Pay.",
  ].join("\n");
}

// Free public translation via MyMemory. No key needed.
export async function translate(text: string, targetLang: string): Promise<string> {
  if (targetLang === "en") return text;
  // MyMemory has a per-request length cap (~500 chars). Chunk by paragraph.
  const chunks = text.split(/\n\n+/);
  const out: string[] = [];
  for (const chunk of chunks) {
    if (!chunk.trim()) { out.push(chunk); continue; }
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=en|${targetLang}`;
      const res = await fetch(url);
      const json = await res.json();
      const t = json?.responseData?.translatedText;
      out.push(typeof t === "string" && t ? t : chunk);
    } catch {
      out.push(chunk);
    }
  }
  return out.join("\n\n");
}
