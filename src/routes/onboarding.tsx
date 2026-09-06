import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { ArrowRight, Check, Sparkles } from "lucide-react";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Welcome — CIVIL.quest" },
      { name: "description", content: "Complete your CIVIL.quest onboarding." },
    ],
  }),
  component: OnboardingPage,
});

const VALUES = [
  { id: "climate", label: "Climate & Environment", emoji: "🌍" },
  { id: "equity", label: "Equity & Justice", emoji: "⚖️" },
  { id: "privacy", label: "Digital Rights", emoji: "🔒" },
  { id: "education", label: "Education & Innovation", emoji: "🎓" },
  { id: "community", label: "Community Building", emoji: "🏘️" },
  { id: "health", label: "Public Health", emoji: "🏥" },
];

function OnboardingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [handle, setHandle] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState(false);

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="font-display text-2xl font-bold">Sign in first</h1>
        <p className="mt-2 text-muted-foreground text-sm">Create an account to start your onboarding.</p>
        <Link to="/auth" search={{ mode: "signup" as const }} className="inline-block mt-6 h-11 px-5 rounded-lg bg-aurora text-white font-medium leading-[2.75rem]">Get started</Link>
      </div>
    );
  }

  const toggleValue = (id: string) => {
    setSelectedValues((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const handleComplete = async () => {
    setBusy(true);
    const cleanHandle = handle.trim().replace(/^@/, "");
    try {
      if (cleanHandle && /^[a-zA-Z0-9_]{3,24}$/.test(cleanHandle)) {
        await supabase.from("profiles").update({
          username: cleanHandle,
          display_name: displayName.trim() || cleanHandle,
        }).eq("id", user.id);
      }
      navigate({ to: "/proposals" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-hero relative">
      <div className="relative mx-auto max-w-xl px-4 py-12 sm:py-20">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-10">
          {[0, 1, 2].map((i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-aurora" : "bg-white/10"}`} />
          ))}
        </div>

        {step === 0 && (
          <div className="text-center">
            <Sparkles className="h-10 w-10 mx-auto text-violet" />
            <h1 className="mt-4 font-display text-3xl sm:text-4xl font-bold">Welcome to CIVIL.quest</h1>
            <p className="mt-3 text-muted-foreground max-w-md mx-auto">
              You are now a citizen of the first active node of the CIVIC Protocol. Let us set up your civic identity in 3 quick steps.
            </p>
            <button
              onClick={() => setStep(1)}
              className="mt-8 h-12 px-8 rounded-lg bg-aurora text-white font-medium glow-electric inline-flex items-center gap-2"
            >
              Start onboarding <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="font-display text-2xl font-bold">What do you care about?</h2>
            <p className="mt-2 text-muted-foreground text-sm">Pick 2–4 values that matter most to you. We will personalize your proposal feed.</p>
            <div className="mt-6 grid sm:grid-cols-2 gap-3">
              {VALUES.map((v) => {
                const active = selectedValues.includes(v.id);
                return (
                  <button
                    key={v.id}
                    onClick={() => toggleValue(v.id)}
                    className={`neon-card p-4 text-left flex items-center gap-3 transition ${active ? "border-electric/40 glow-electric" : ""}`}
                  >
                    <span className="text-2xl">{v.emoji}</span>
                    <span className="font-medium text-sm">{v.label}</span>
                    {active && <Check className="h-4 w-4 text-electric ml-auto" />}
                  </button>
                );
              })}
            </div>
            <div className="mt-8 flex justify-between">
              <button onClick={() => setStep(0)} className="text-sm text-muted-foreground hover:text-foreground">Back</button>
              <button
                onClick={() => setStep(2)}
                disabled={selectedValues.length < 2}
                className="h-11 px-6 rounded-lg bg-aurora text-white font-medium glow-electric disabled:opacity-60 inline-flex items-center gap-2"
              >
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="font-display text-2xl font-bold">Choose your handle</h2>
            <p className="mt-2 text-muted-foreground text-sm">This is your public identity on the network.</p>

            <div className="mt-6 space-y-4">
              <label className="block">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">Username</span>
                <div className="mt-1 flex items-center gap-2 px-3 rounded-lg border border-white/10 bg-white/[0.03]">
                  <span className="text-muted-foreground">@</span>
                  <input
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    placeholder="yourhandle"
                    className="w-full bg-transparent outline-none text-sm py-2.5 placeholder:text-muted-foreground/60"
                  />
                </div>
              </label>
              <label className="block">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">Display name</span>
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="How you want to be known"
                  className="mt-1 w-full px-3 rounded-lg border border-white/10 bg-white/[0.03] outline-none text-sm py-2.5 placeholder:text-muted-foreground/60"
                />
              </label>
            </div>

            <div className="mt-8 flex justify-between">
              <button onClick={() => setStep(1)} className="text-sm text-muted-foreground hover:text-foreground">Back</button>
              <button
                onClick={handleComplete}
                disabled={busy}
                className="h-11 px-6 rounded-lg bg-aurora text-white font-medium glow-electric disabled:opacity-60 inline-flex items-center gap-2"
              >
                {busy ? "Saving…" : "Enter the network"} <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
