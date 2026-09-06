import type { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement> & { color?: string };

const stop = (c: string) => c;

/** Hex badge wrapper — wraps any icon in the CIVIL.quest hex frame. */
export function HexBadge({ color = "oklch(0.62 0.26 265)", children, glow = true }: {
  color?: string; children: React.ReactNode; glow?: boolean;
}) {
  return (
    <span
      className={`relative inline-flex items-center justify-center w-14 h-14 ${glow ? "" : ""}`}
      style={{
        filter: glow ? `drop-shadow(0 0 12px ${color})` : undefined,
      }}
    >
      <svg viewBox="0 0 56 56" className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id={`hex-${color}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.95" />
            <stop offset="100%" stopColor={color} stopOpacity="0.55" />
          </linearGradient>
        </defs>
        <polygon
          points="28,2 52,16 52,40 28,54 4,40 4,16"
          fill="oklch(0.16 0.05 266)"
          stroke={`url(#hex-${color})`}
          strokeWidth="2"
        />
      </svg>
      <span className="relative">{children}</span>
    </span>
  );
}

export function ProposalIcon(p: Props) {
  const c = p.color ?? "oklch(0.66 0.22 300)";
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" {...p}>
      <path d="M7 3h7l4 4v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" stroke={stop(c)} strokeWidth="1.6" fill="none"/>
      <path d="M14 3v4h4" stroke={c} strokeWidth="1.6" fill="none"/>
      <path d="M8 12h8M8 16h5" stroke={c} strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}

export function VoteIcon(p: Props) {
  const c = p.color ?? "oklch(0.62 0.26 265)";
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" {...p}>
      <rect x="4" y="10" width="16" height="10" rx="1.5" stroke={c} strokeWidth="1.6" fill="none"/>
      <path d="M9 13l2.2 2.2L16 10.4" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

export function AgentIcon(p: Props) {
  const c = p.color ?? "oklch(0.78 0.15 215)";
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" {...p}>
      <path d="M12 3l8 4v6c0 4.6-3.4 7.6-8 8-4.6-.4-8-3.4-8-8V7l8-4z" stroke={c} strokeWidth="1.6" fill="none"/>
      <circle cx="9.5" cy="11" r="1" fill={c}/>
      <circle cx="14.5" cy="11" r="1" fill={c}/>
      <path d="M9 15c1 .8 2 1.2 3 1.2s2-.4 3-1.2" stroke={c} strokeWidth="1.4" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

export function ConsensusIcon(p: Props) {
  const c = p.color ?? "oklch(0.85 0.17 90)";
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" {...p}>
      <circle cx="8" cy="10" r="3" stroke={c} strokeWidth="1.6" fill="none"/>
      <circle cx="16" cy="10" r="3" stroke={c} strokeWidth="1.6" fill="none"/>
      <circle cx="12" cy="16" r="3" stroke={c} strokeWidth="1.6" fill="none"/>
    </svg>
  );
}

export function FlameIcon(p: Props) {
  const c = p.color ?? "oklch(0.70 0.27 0)";
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" {...p}>
      <path d="M12 3s5 4.5 5 9a5 5 0 0 1-10 0c0-2 1-3 2-4-.2 1.5.3 2.5 1 3 0-3 .5-5 2-8z"
        stroke={c} strokeWidth="1.6" fill={c} fillOpacity="0.18" strokeLinejoin="round"/>
    </svg>
  );
}

export function NodeIcon(p: Props) {
  const c = p.color ?? "oklch(0.78 0.15 215)";
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" {...p}>
      <polygon points="12,3 21,8 21,16 12,21 3,16 3,8" stroke={c} strokeWidth="1.6" fill="none"/>
      <circle cx="12" cy="12" r="2.2" fill={c}/>
    </svg>
  );
}

export function StarSparkIcon(p: Props) {
  const c = p.color ?? "oklch(0.85 0.17 90)";
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" {...p}>
      <path d="M12 3l2 6 6 1.5-4.5 3.5L17 21l-5-3-5 3 1.5-7L4 10.5 10 9z" fill={c} stroke={c} strokeWidth="0.8" strokeLinejoin="round"/>
    </svg>
  );
}
