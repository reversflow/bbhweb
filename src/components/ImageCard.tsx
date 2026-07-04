import { cn } from "@/lib/utils";

interface ImageCardProps {
  label?: string;
  title?: string;
  subtitle?: string;
  seed?: string;
  className?: string;
  tone?: "blue" | "red" | "purple" | "mixed";
  aspect?: string;
  overlay?: boolean;
  children?: React.ReactNode;
}

const toneMap: Record<NonNullable<ImageCardProps["tone"]>, string> = {
  blue: "from-electric/40 via-electric/10 to-transparent",
  red: "from-blood/40 via-blood/10 to-transparent",
  purple: "from-purple-glow/40 via-purple-glow/10 to-transparent",
  mixed:
    "from-electric/30 via-purple-glow/20 to-blood/30",
};

/**
 * Placeholder visual card — deep gradient + noise, ready to be swapped
 * with a real image later. Uses semantic tokens only.
 */
export function ImageCard({
  label,
  title,
  subtitle,
  className,
  tone = "blue",
  aspect = "aspect-[4/5]",
  overlay = true,
  children,
}: ImageCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-3xl border border-white/10 bg-surface card-hover",
        aspect,
        className,
      )}
    >
      {/* backdrop */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-90 transition-transform duration-700 group-hover:scale-105",
          toneMap[tone],
        )}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.06),transparent_60%)]" />
      <div className="noise absolute inset-0" />

      {/* dark bottom overlay for legibility */}
      {overlay && (
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      )}

      <div className="relative flex h-full flex-col justify-between p-6">
        <div className="flex items-start justify-between gap-3">
          {label && (
            <span className="inline-flex items-center rounded-full border border-electric/40 bg-electric/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-electric-glow backdrop-blur">
              {label}
            </span>
          )}
          {children}
        </div>

        {(title || subtitle) && (
          <div>
            {subtitle && (
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {subtitle}
              </p>
            )}
            {title && (
              <h3 className="mt-2 font-display text-3xl font-black leading-tight tracking-tight">
                {title}
              </h3>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
