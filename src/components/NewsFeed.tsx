import { useEffect, useState } from "react";
import { Newspaper, ExternalLink, Loader2 } from "lucide-react";

interface Item { title: string; link: string; pubDate?: string; description?: string; source?: string; }

const FEEDS = [
  { url: "https://cointelegraph.com/rss/tag/solana", source: "Cointelegraph" },
  { url: "https://decrypt.co/feed?tag=solana", source: "Decrypt" },
];

function strip(html: string) {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim().slice(0, 180);
}

export function NewsFeed() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const all = await Promise.all(
          FEEDS.map(async (f) => {
            const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(f.url)}`);
            const json = await res.json();
            return (json.items || []).slice(0, 6).map((it: { title: string; link: string; pubDate: string; description: string }) => ({
              title: it.title, link: it.link, pubDate: it.pubDate,
              description: strip(it.description || ""), source: f.source,
            })) as Item[];
          })
        );
        if (cancelled) return;
        const merged = all.flat()
          .filter((i) => /solana|sol\b/i.test(i.title + " " + (i.description || "")))
          .sort((a, b) => +new Date(b.pubDate || 0) - +new Date(a.pubDate || 0))
          .slice(0, 12);
        setItems(merged.length ? merged : all.flat().slice(0, 12));
      } catch {
        if (!cancelled) setError("Couldn't load live news. Try again later.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="glass rounded-2xl p-5 h-full">
      <div className="flex items-center gap-2 mb-4">
        <Newspaper className="size-4 text-accent" />
        <h2 className="text-sm font-semibold uppercase tracking-widest">Solana News</h2>
      </div>
      {loading && (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="size-4 animate-spin" /> Loading headlines…
        </div>
      )}
      {error && <div className="text-sm text-destructive">{error}</div>}
      <ul className="space-y-3">
        {items.map((it, i) => (
          <li key={i} className="group">
            <a href={it.link} target="_blank" rel="noreferrer" className="block p-3 rounded-lg hover:bg-card/60 transition border border-transparent hover:border-border">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[10px] uppercase tracking-widest text-accent">{it.source}</span>
                <ExternalLink className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
              </div>
              <div className="font-medium text-sm leading-snug text-foreground">{it.title}</div>
              {it.description && <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{it.description}</div>}
              {it.pubDate && <div className="text-[10px] text-muted-foreground mt-1">{new Date(it.pubDate).toLocaleString()}</div>}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
