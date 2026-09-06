import { Link } from "@tanstack/react-router";
import { LogoWordmark } from "@/components/brand/Logo";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Menu, X, Globe, Moon, Sun, Search } from "lucide-react";
import { useState } from "react";
import { useCalmMode, useLang, LANG_OPTIONS } from "@/hooks/use-calm-mode";
import { useT } from "@/hooks/use-i18n";

export function SiteHeader() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const { calm, toggle } = useCalmMode();
  const { lang, setLang } = useLang();
  const [langOpen, setLangOpen] = useState(false);
  const { t } = useT();

  const NAV = [
    { to: "/", label: t("nav.home", "Home") },
    { to: "/proposals", label: t("nav.actions", "Actions") },
    { to: "/agents", label: t("nav.agents", "Agents") },
    { to: "/groups", label: t("nav.constituents", "Constituents") },
    { to: "/leaderboard", label: t("nav.leaderboard", "Leaderboard") },
    { to: "/records", label: "Records" },
    { to: "/protocol", label: "Protocol" },
    { to: "/about", label: "About" },
  ] as const;

  const handle =
    (user?.user_metadata as any)?.username ||
    user?.email?.split("@")[0] ||
    "citizen";

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/60 border-b border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <LogoWordmark size={32} />

        <nav className="hidden lg:flex items-center gap-1">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to}
              className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground rounded-md transition-colors"
              activeProps={{ className: "text-foreground bg-white/5" }}>
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/search" className="h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-white/5 text-muted-foreground" aria-label="Search">
            <Search className="h-4 w-4" />
          </Link>
          <button onClick={toggle} title={calm ? "Calm mode on" : "Animations on"}
            className="hidden sm:inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-white/5 text-muted-foreground" aria-label="Toggle calm mode">
            {calm ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>

          <div className="hidden sm:block relative">
            <button onClick={() => setLangOpen((o) => !o)}
              className="h-9 px-2 inline-flex items-center gap-1 rounded-md hover:bg-white/5 text-muted-foreground text-xs" aria-label="Language">
              <Globe className="h-4 w-4" /> {lang}
            </button>
            {langOpen && (
              <div className="absolute right-0 mt-2 w-28 rounded-md border border-white/10 bg-background/95 backdrop-blur-xl py-1 z-50">
                {LANG_OPTIONS.map((l) => (
                  <button key={l} onClick={() => { setLang(l); setLangOpen(false); }}
                    className={`w-full text-left px-3 py-1.5 text-xs hover:bg-white/5 ${l === lang ? "text-electric" : ""}`}>
                    {l}
                  </button>
                ))}
              </div>
            )}
          </div>

          {user ? (
            <>
              <Link to="/missions" className="hidden md:inline-flex h-9 px-3 items-center rounded-md text-sm hover:bg-white/5">Missions</Link>
              <Link to="/profile" className="hidden sm:inline-flex h-9 px-3 items-center rounded-md text-sm hover:bg-white/5">Profile</Link>
              <button onClick={() => supabase.auth.signOut()}
                className="h-9 px-3 inline-flex items-center rounded-md text-sm border border-white/10 hover:bg-white/5">Sign out</button>
            </>
          ) : (
            <>
              <Link to="/auth" className="hidden sm:inline-flex h-9 px-3 items-center rounded-md text-sm text-foreground hover:bg-white/5 whitespace-nowrap">Sign in</Link>
              <Link to="/auth" search={{ mode: "signup" as const }}
                className="h-9 px-4 inline-flex items-center rounded-md text-sm font-medium bg-aurora text-white glow-electric hover:opacity-90 whitespace-nowrap">
                {t("cta.join", "Join")}
              </Link>
            </>
          )}

          <button className="lg:hidden h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-white/5" onClick={() => setOpen((o) => !o)} aria-label="Menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-white/5 bg-background/95 backdrop-blur-xl">
          <div className="px-4 py-3 flex flex-col">
            {user && (
              <Link
                to="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between py-3 mb-1 border-b border-white/10"
              >
                <span className="text-sm">
                  <span className="text-muted-foreground">Signed in as </span>
                  <span className="text-foreground font-medium">@{handle}</span>
                </span>
                <span className="text-xs text-electric">View profile →</span>
              </Link>
            )}
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)}
                className="py-3 text-base text-muted-foreground hover:text-foreground border-b border-white/5 last:border-0"
                activeProps={{ className: "text-foreground" }}>
                {n.label}
              </Link>
            ))}
            {user && (
              <>
                <Link to="/missions" onClick={() => setOpen(false)} className="py-3 text-base text-muted-foreground border-b border-white/5">Missions</Link>
                <button
                  onClick={() => { setOpen(false); supabase.auth.signOut(); }}
                  className="mt-4 h-11 px-3 inline-flex items-center justify-center rounded-md text-sm border border-white/10 hover:bg-white/5"
                >
                  Sign out
                </button>
              </>
            )}
            {!user && (
              <Link
                to="/auth"
                onClick={() => setOpen(false)}
                className="mt-4 h-11 px-3 inline-flex items-center justify-center rounded-md text-sm border border-white/10 hover:bg-white/5"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-white/5 bg-background/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 grid gap-10 md:grid-cols-4">
        <div className="col-span-2">
          <LogoWordmark size={28} />
          <p className="mt-4 text-sm text-muted-foreground max-w-md">
            CIVIL.wc.tc is the first active node of the CIVIC Protocol — a gamified,
            decentralized democracy platform where citizens, agents, and ideas
            orbit together to create real-world impact.
          </p>
          <p className="mt-3 text-xs text-muted-foreground">
            <span className="text-gradient-aurora font-medium">Play. Participate. Progress.</span>
          </p>
        </div>
        <FooterCol title="Platform" links={[
          ["Actions", "/proposals"],
          ["Agents", "/agents"],
          ["Constituents", "/groups"],
          ["Records", "/records"],
          ["Leaderboard", "/leaderboard"],
          ["Contribute", "/contribute"],
        ]} />
        <FooterCol title="Learn" links={[
          ["Protocol", "/protocol"],
          ["How it Works", "/how-it-works"],
          ["About", "/about"],
          ["Help", "/help"],
          ["Search", "/search"],
        ]} />
      </div>
      <div className="border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 text-xs text-muted-foreground flex flex-wrap justify-between gap-2">
          <span>© {new Date().getFullYear()} WC.TC · CIVIL.wc.tc — Govern. Collaborate. Evolve.</span>
          <span className="flex gap-3">
            <a href="/api/public/feed.xml" className="hover:text-foreground">RSS</a>
            <a href="/api/public/feed.json" className="hover:text-foreground">JSON</a>
            <span>Pre-Alpha</span>
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: ReadonlyArray<readonly [string, string]> }) {
  return (
    <div>
      <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">{title}</h4>
      <ul className="space-y-2">
        {links.map(([label, to]) => (
          <li key={to}>
            <Link to={to} className="text-sm text-foreground/80 hover:text-foreground">{label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
