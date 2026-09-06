import { Link } from "@tanstack/react-router";
import civilIcon from "@/assets/civil-icon.png.asset.json";

export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <img
      src={civilIcon.url}
      alt="CIVIL.wc.tc"
      width={size}
      height={size}
      className="rounded-[20%]"
      style={{ width: size, height: size }}
    />
  );
}

export function LogoWordmark({ size = 32 }: { size?: number }) {
  return (
    <Link to="/" className="flex items-center gap-3 group">
      <span className="relative inline-flex">
        <span className="absolute inset-0 rounded-full blur-md bg-aurora opacity-50 group-hover:opacity-80 transition-opacity" />
        <span className="relative"><LogoMark size={size} /></span>
      </span>
      <span className="flex items-baseline gap-0.5 font-display font-semibold tracking-tight">
        <span className="text-foreground text-xl">CIVIL</span>
        <span className="text-gradient-aurora text-xl">.quest</span>
      </span>
    </Link>
  );
}
