import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

export type Crumb = { name: string; path: string };

/**
 * Accessible breadcrumb trail. The matching BreadcrumbList JSON-LD is emitted
 * by each route's head() via `breadcrumbJsonLd`.
 */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Fil d'Ariane" className="text-[11px] uppercase tracking-[0.2em]">
      <ol className="flex flex-wrap items-center gap-1.5 text-muted-foreground">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={item.path} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="size-3 opacity-50" aria-hidden="true" />}
              {last ? (
                <span aria-current="page" className="text-foreground/80">
                  {item.name}
                </span>
              ) : (
                <Link to={item.path} className="transition hover:text-foreground">
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
