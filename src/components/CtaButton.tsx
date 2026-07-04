import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

interface CtaButtonProps {
  to?: string;
  href?: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  type?: "button" | "submit";
  onClick?: () => void;
}

const styles: Record<NonNullable<CtaButtonProps["variant"]>, string> = {
  primary:
    "bg-white text-black hover:scale-[1.03] shadow-[0_10px_40px_-10px_rgba(255,255,255,0.35)]",
  secondary:
    "border border-white/15 bg-white/5 text-foreground backdrop-blur hover:bg-white/10 hover:border-electric/40",
  ghost: "text-foreground hover:text-electric-glow",
};

export function CtaButton({
  to,
  href,
  children,
  variant = "primary",
  className,
  type = "button",
  onClick,
}: CtaButtonProps) {
  const cls = cn(
    "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold tracking-tight transition-all duration-300",
    styles[variant],
    className,
  );
  if (to) {
    return (
      <Link to={to} className={cls} onClick={onClick}>
        {children}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={cls} onClick={onClick}>
        {children}
      </a>
    );
  }
  return (
    <button type={type} className={cls} onClick={onClick}>
      {children}
    </button>
  );
}
