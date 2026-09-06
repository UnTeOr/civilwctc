/**
 * The hero "civic orbit" — a stylized representation of citizens, agents and
 * proposals orbiting a shared center. Pure SVG so it scales perfectly and
 * stays sharp on every screen. Animation is paused for reduced-motion users.
 */
export function OrbitScene({ className = "" }: { className?: string }) {
  return (
    <div className={`relative aspect-square w-full max-w-[640px] mx-auto ${className}`}>
      <div className="absolute inset-0 bg-aurora rounded-full blur-3xl opacity-20 animate-pulse-glow" />
      <svg viewBox="0 0 600 600" className="relative w-full h-full">
        <defs>
          <radialGradient id="orb-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="oklch(0.95 0.05 220)" />
            <stop offset="40%" stopColor="oklch(0.62 0.26 265)" />
            <stop offset="100%" stopColor="oklch(0.13 0.04 265 / 0)" />
          </radialGradient>
          <linearGradient id="orb-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.66 0.22 300)" stopOpacity="0.9" />
            <stop offset="50%" stopColor="oklch(0.62 0.26 265)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="oklch(0.78 0.15 215)" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {/* Core glow */}
        <circle cx="300" cy="300" r="170" fill="url(#orb-core)" />
        <circle cx="300" cy="300" r="40" fill="oklch(0.95 0.05 220)" opacity="0.9" />

        {/* Concentric rings */}
        {[120, 170, 220, 270].map((r, i) => (
          <ellipse
            key={r}
            cx="300"
            cy="320"
            rx={r}
            ry={r / 3.2}
            fill="none"
            stroke="url(#orb-ring)"
            strokeWidth={i === 1 ? 1.5 : 0.8}
            opacity={0.7 - i * 0.12}
          />
        ))}

        {/* Orbiting nodes (stylized citizens / agents) */}
        <g className="animate-orbit" style={{ transformOrigin: "300px 320px" }}>
          {Array.from({ length: 16 }).map((_, i) => {
            const angle = (i / 16) * Math.PI * 2;
            const rx = 270, ry = 270 / 3.2;
            const x = 300 + Math.cos(angle) * rx;
            const y = 320 + Math.sin(angle) * ry;
            const color = ["oklch(0.62 0.26 265)", "oklch(0.66 0.22 300)", "oklch(0.78 0.15 215)", "oklch(0.85 0.17 90)"][i % 4];
            return <circle key={i} cx={x} cy={y} r={4} fill={color} />;
          })}
        </g>

        {/* Marquee nodes (rights cards / proposals) */}
        <g>
          <circle cx="120" cy="180" r="9" fill="oklch(0.66 0.22 300)" opacity="0.95">
            <animate attributeName="r" values="9;12;9" dur="3.4s" repeatCount="indefinite" />
          </circle>
          <circle cx="480" cy="180" r="9" fill="oklch(0.78 0.15 215)" opacity="0.95">
            <animate attributeName="r" values="9;12;9" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="300" cy="100" r="11" fill="oklch(0.85 0.17 90)" opacity="0.95">
            <animate attributeName="r" values="11;14;11" dur="2.6s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* Stars */}
        {Array.from({ length: 60 }).map((_, i) => {
          const x = (i * 97) % 600;
          const y = (i * 53) % 600;
          return <circle key={i} cx={x} cy={y} r={Math.random() > 0.7 ? 1.5 : 0.6} fill="oklch(0.95 0.05 220)" opacity={0.4 + Math.random() * 0.5} />;
        })}
      </svg>
    </div>
  );
}
