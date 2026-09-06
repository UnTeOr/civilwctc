import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { LogoWordmark } from "@/components/brand/Logo";
import { Mail, Lock, User, AlertCircle, Wallet, Building2, Bot } from "lucide-react";
import { useSolanaWallet } from "@/hooks/use-solana-wallet";

const searchSchema = z.object({
  mode: z.enum(["signin", "signup"]).optional().default("signin"),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in — CIVIL.quest" },
      { name: "description", content: "Sign in or create your CIVIL.quest account. Email + password, or connect your Solana wallet." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode } = useSearch({ from: "/auth" });
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(mode === "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [accountType, setAccountType] = useState<"human" | "organization" | "agent">("human");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (isSignup) {
        const handle = username.trim().replace(/^@/, "");
        if (!/^[a-zA-Z0-9_]{3,24}$/.test(handle)) {
          throw new Error("Username must be 3–24 letters, numbers, or underscores.");
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { username: handle, display_name: handle, account_type: accountType },
          },
        });
        if (error) throw error;
        navigate({ to: "/" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-hero relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,oklch(0.30_0.18_270_/_0.4),transparent_60%)]" />
      <div className="relative mx-auto max-w-md px-4 py-12 sm:py-20">
        <div className="text-center mb-8">
          <div className="inline-flex"><LogoWordmark size={40} /></div>
        </div>

        <div className="neon-card p-7">
          <h1 className="font-display text-2xl font-bold text-center">
            {isSignup ? "Join the network" : "Welcome back"}
          </h1>
          <p className="text-center text-sm text-muted-foreground mt-1">
            {isSignup ? "Create your civic identity." : "Sign in to your civic identity."}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {isSignup && (
              <div>
                <span className="text-xs uppercase tracking-wider text-muted-foreground">Account type</span>
                <div className="mt-1 grid grid-cols-3 gap-2">
                  {([
                    { v: "human", label: "Human", icon: <User className="h-4 w-4" /> },
                    { v: "organization", label: "Organization", icon: <Building2 className="h-4 w-4" /> },
                    { v: "agent", label: "Agent", icon: <Bot className="h-4 w-4" /> },
                  ] as const).map((o) => (
                    <button
                      key={o.v}
                      type="button"
                      onClick={() => setAccountType(o.v)}
                      className={`h-16 rounded-lg border text-xs flex flex-col items-center justify-center gap-1 transition ${
                        accountType === o.v ? "border-electric/60 bg-electric/10 text-foreground glow-electric" : "border-white/10 text-muted-foreground hover:bg-white/5"
                      }`}
                    >
                      {o.icon}
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {isSignup && (
              <Field icon={<User className="h-4 w-4" />} label="Username">
                <input
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="@yourhandle"
                  className="w-full bg-transparent outline-none text-sm py-2.5 placeholder:text-muted-foreground/60"
                />
              </Field>
            )}
            <Field icon={<Mail className="h-4 w-4" />} label="Email">
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@civic.network"
                className="w-full bg-transparent outline-none text-sm py-2.5 placeholder:text-muted-foreground/60"
              />
            </Field>
            <Field icon={<Lock className="h-4 w-4" />} label="Password">
              <input
                required
                type="password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full bg-transparent outline-none text-sm py-2.5 placeholder:text-muted-foreground/60"
              />
            </Field>

            {error && (
              <div className="flex items-start gap-2 text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-md p-3">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full h-11 rounded-lg bg-aurora text-white font-medium glow-electric disabled:opacity-60"
            >
              {busy ? "…" : isSignup ? "Create account" : "Sign in"}
            </button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <SolanaWalletButton />

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isSignup ? "Already have an account?" : "New to CIVIL.quest?"}{" "}
            <button
              type="button"
              onClick={() => { setIsSignup(!isSignup); setError(null); }}
              className="text-electric font-medium hover:underline"
            >
              {isSignup ? "Sign in" : "Create one"}
            </button>
          </p>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          <Link to="/" className="hover:text-foreground">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}

function SolanaWalletButton() {
  const wallet = useSolanaWallet();
  const [error, setError] = useState<string | null>(null);

  if (wallet.connected && wallet.publicKey) {
    return (
      <div className="w-full neon-card p-3 text-center">
        <div className="text-xs text-muted-foreground mb-1">Connected wallet</div>
        <div className="font-mono text-sm text-violet font-medium truncate">{wallet.publicKey.slice(0, 6)}…{wallet.publicKey.slice(-4)}</div>
        <button
          onClick={() => wallet.disconnect()}
          className="mt-2 text-xs text-muted-foreground hover:text-foreground underline"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={async () => {
          setError(null);
          try {
            await wallet.connect();
          } catch (e) {
            setError("Could not connect wallet. Make sure you have Phantom or Solflare installed.");
          }
        }}
        disabled={wallet.connecting}
        className="w-full h-11 rounded-lg border border-white/10 text-sm flex items-center justify-center gap-2 hover:bg-white/5 disabled:opacity-60 transition"
      >
        <Wallet className="h-4 w-4 text-violet" />
        {wallet.connecting ? "Connecting…" : "Connect Solana Wallet"}
      </button>
      {error && <p className="mt-2 text-xs text-destructive text-center">{error}</p>}
    </div>
  );
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="mt-1 flex items-center gap-2 px-3 rounded-lg border border-white/10 bg-white/[0.03] focus-within:border-electric/50 focus-within:glow-electric transition">
        <span className="text-muted-foreground">{icon}</span>
        {children}
      </div>
    </label>
  );
}
