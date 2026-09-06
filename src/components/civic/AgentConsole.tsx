import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useRouter } from "@tanstack/react-router";
import { Loader2, Power, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { activateAgent, askAgent } from "@/lib/agent-ai.functions";
import { useAuth } from "@/hooks/use-auth";

interface Props {
  slug: string;
  ownerId: string | null;
  activatedAt: string | null;
  protocol: string;
  agentName: string;
}

export function AgentConsole({ slug, ownerId, activatedAt, protocol, agentName }: Props) {
  const { user } = useAuth();
  const router = useRouter();
  const activate = useServerFn(activateAgent);
  const ask = useServerFn(askAgent);
  const [statement, setStatement] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [thread, setThread] = useState<{ role: "you" | "agent"; text: string }[]>([]);

  const isOwner = !!user && user.id === ownerId;

  const activation = useMutation({
    mutationFn: () => activate({ data: { slug } }),
    onSuccess: (r) => {
      setStatement(r.statement);
      toast.success(`${r.name} is live under the ${r.protocol}`);
      router.invalidate();
    },
    onError: (e: any) => toast.error(e?.message ?? "Activation failed"),
  });

  const send = useMutation({
    mutationFn: (text: string) => ask({ data: { slug, message: text } }),
    onSuccess: (r) => setThread((t) => [...t, { role: "agent", text: r.reply }]),
    onError: (e: any) => {
      toast.error(e?.message ?? "The agent could not answer");
      setThread((t) => t.slice(0, -1));
    },
  });

  const onSend = () => {
    const text = message.trim();
    if (!text || send.isPending) return;
    setThread((t) => [...t, { role: "you", text }]);
    setMessage("");
    send.mutate(text);
  };

  return (
    <div className="mt-6 neon-card p-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground">Agent console</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {activatedAt
              ? `Live and running under the ${protocol}.`
              : `Not activated yet — activation writes the ${protocol} into its file.`}
          </p>
        </div>
        {isOwner && (
          <button
            onClick={() => activation.mutate()}
            disabled={activation.isPending}
            className="inline-flex items-center gap-2 rounded-full border border-electric/50 bg-electric/10 px-4 py-2 text-sm text-electric disabled:opacity-60"
          >
            {activation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Power className="h-4 w-4" />}
            {activatedAt ? "Re-activate" : "Activate agent"}
          </button>
        )}
      </div>

      {statement && (
        <p className="mt-4 rounded-lg border border-violet/30 bg-violet/5 p-4 text-sm text-foreground/90">
          <Sparkles className="mr-2 inline h-3.5 w-3.5 text-violet" />
          {statement}
        </p>
      )}

      {activatedAt && (
        <div className="mt-6">
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {thread.map((m, i) => (
              <div
                key={i}
                className={`rounded-lg p-3 text-sm whitespace-pre-line ${
                  m.role === "you" ? "bg-white/5 border border-white/10" : "bg-electric/5 border border-electric/20"
                }`}
              >
                <span className="block text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  {m.role === "you" ? "You" : agentName}
                </span>
                {m.text}
              </div>
            ))}
            {send.isPending && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> {agentName} is thinking…
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-2">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSend()}
              placeholder={`Ask ${agentName} about an action item…`}
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-electric"
            />
            <button
              onClick={onSend}
              disabled={send.isPending || !message.trim()}
              className="inline-flex items-center gap-2 rounded-lg border border-electric/50 bg-electric/10 px-4 text-sm text-electric disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
