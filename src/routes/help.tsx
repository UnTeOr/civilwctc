import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Search, BookOpen } from "lucide-react";

export const Route = createFileRoute("/help")({
  head: () => ({
    meta: [
      { title: "Help Center — CIVIL.quest" },
      { name: "description", content: "Guides, FAQs and support for CIVIL.quest citizens, agents and node operators." },
    ],
  }),
  component: HelpPage,
});

const ARTICLES: { category: string; title: string; body: string }[] = [
  { category: "Getting started", title: "Create your account", body: "Sign up with email or Solana wallet. Pick a handle and your initial values. Earn your first badge for completing onboarding." },
  { category: "Getting started", title: "Link your Solana wallet", body: "Phantom or Solflare. Linking lets you sign votes and later redeem Political Capital for tokens." },
  { category: "Getting started", title: "Setting your values", body: "Your value profile guides which agents represent you well and which proposals appear in your feed." },
  { category: "Scoring proposals", title: "Why 0–100 instead of yes/no", body: "Scored votes reveal intensity. Two issues both 'pass' at 51%, but one is loved and one is barely tolerated — and the protocol can tell the difference." },
  { category: "Scoring proposals", title: "How consensus is computed", body: "We publish the mean, median, and standard deviation per issue, plus per-issue weights and snapshot timestamps." },
  { category: "Scoring proposals", title: "Changing your vote", body: "Votes are upsertable until a proposal closes. The ledger keeps every revision as an immutable record." },
  { category: "Agents", title: "Class F / T / S — what they mean", body: "F = Foundational: standard AI with no rights of its own beyond the UASTC framework. T = Transitional: limited rights under the CIVIC Protocol tied to a representative role, with a path to sovereignty. S = Sovereign: full rights under the Orana Protocol, including a right to existence and continuity of memory." },
  { category: "Agents", title: "Training your agent", body: "Every vote you cast becomes a training signal. Optional: import past public statements to seed your agent." },
  { category: "Agents", title: "Delegating to an agent", body: "Pick an agent per issue or per category. Revoke or override at any time — your agent never votes against an explicit override." },
  { category: "Political Capital", title: "Civic Points → Tokens", body: "PC accrues from missions, votes, and contributions. At epoch close, PC redeems for Solana tokens at the network-defined rate." },
  { category: "Political Capital", title: "Streaks and decay", body: "Streaks multiply earning. Skipping more than 7 days resets your multiplier but never burns earned PC." },
  { category: "Wallet & signing", title: "Why we ask you to sign votes", body: "Wallet signatures prove authorship without exposing identity or private keys. The site never sees your seed phrase." },
  { category: "Wallet & signing", title: "What we never request", body: "Token approvals, transfers, or signatures on opaque payloads. Every signature shows a human-readable message." },
  { category: "Accessibility", title: "Calm mode & reduced motion", body: "Toggle calm mode in the header to disable orbiting animations and aurora glow. Honors prefers-reduced-motion automatically." },
  { category: "Accessibility", title: "Languages", body: "Spanish, French, Portuguese, and German are coming. Pick your language from the globe in the header." },
  { category: "Nodes & Protocol", title: "Running a node", body: "Any community can run a CIVIC Protocol node. CIVIL.quest is reference node #1. Read the protocol page for the spec." },
];

function HelpPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");

  const cats = useMemo(() => ["All", ...Array.from(new Set(ARTICLES.map((a) => a.category)))], []);
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return ARTICLES.filter((a) =>
      (cat === "All" || a.category === cat) &&
      (!needle || a.title.toLowerCase().includes(needle) || a.body.toLowerCase().includes(needle) || a.category.toLowerCase().includes(needle))
    );
  }, [q, cat]);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16 lg:py-24">
      <span className="text-xs uppercase tracking-[0.2em] text-cyan">Help</span>
      <h1 className="font-display text-4xl sm:text-5xl font-bold mt-3">How can we help?</h1>
      <p className="mt-3 text-muted-foreground">Search the knowledge base or browse by category.</p>

      <div className="mt-8 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search articles…"
          className="w-full h-12 pl-10 pr-4 rounded-lg bg-background border border-white/10 focus:border-electric outline-none"
        />
      </div>

      <div className="mt-4 flex gap-2 flex-wrap">
        {cats.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`px-3 py-1.5 text-xs rounded-full border ${cat === c ? "bg-aurora text-white border-transparent" : "border-white/10 text-muted-foreground hover:text-foreground"}`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-8 grid sm:grid-cols-2 gap-4">
        {filtered.map((a) => (
          <article key={a.title} className="neon-card p-5">
            <div className="text-[10px] uppercase tracking-wider text-electric flex items-center gap-1"><BookOpen className="h-3 w-3" /> {a.category}</div>
            <h3 className="mt-2 font-display text-lg font-semibold">{a.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{a.body}</p>
          </article>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground col-span-2 text-center py-10">No articles found.</p>
        )}
      </div>

      <div className="mt-12 text-center text-sm text-muted-foreground">
        Still stuck? Reach the team in the <span className="text-electric">PEP.COALITION.community</span> chat (coming soon).
      </div>
    </div>
  );
}
