import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow && (
        <div
          className={cn(
            "flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.25em] text-electric-glow",
            align === "center" && "justify-center",
          )}
        >
          <span className="h-px w-8 bg-electric/60" />
          {eyebrow}
        </div>
      )}
      <h2 className="mt-4 font-display text-4xl font-black leading-[1.05] tracking-tighter sm:text-5xl md:text-6xl">
        {title}
      </h2>
      {description && (
        <p className="mt-5 text-base text-muted-foreground sm:text-lg">{description}</p>
      )}
    </div>
  );
}
