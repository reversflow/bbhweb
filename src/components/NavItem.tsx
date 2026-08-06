import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import type { NavLink } from "@/lib/site-content.shared";

/**
 * Renders one CMS-managed navigation entry. Internal paths use the router,
 * external URLs (or links flagged external) use a safe anchor.
 */
export function NavItem({
  link,
  className,
  activeClassName,
  inactiveClassName,
  onClick,
  exact,
}: {
  link: Pick<NavLink, "label" | "url" | "external" | "new_tab">;
  className?: string;
  activeClassName?: string;
  inactiveClassName?: string;
  onClick?: () => void;
  exact?: boolean;
}) {
  const isExternal = link.external || /^(https?:|mailto:|tel:)/i.test(link.url);

  if (isExternal) {
    return (
      <a
        href={link.url}
        onClick={onClick}
        className={cn(className, inactiveClassName)}
        {...(link.new_tab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {link.label}
      </a>
    );
  }

  return (
    <Link
      to={link.url as never}
      onClick={onClick}
      activeOptions={{ exact: exact ?? link.url === "/" }}
      activeProps={activeClassName ? { className: activeClassName } : undefined}
      inactiveProps={inactiveClassName ? { className: inactiveClassName } : undefined}
      className={className}
    >
      {link.label}
    </Link>
  );
}
