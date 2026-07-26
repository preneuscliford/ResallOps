"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/inventory", label: "Stock" },
  { href: "/opportunities/new", label: "Ajouter" },
];

export function SiteNav() {
  const pathname = usePathname();

  return (
    <header className="site-nav">
      <div className="site-nav-inner">
        <Link className="site-nav-brand" href="/">
          ResallOps Radar
        </Link>
        <nav className="site-nav-links">
          {links.map((link) => {
            const isActive =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);

            return (
              <Link
                className={`site-nav-link${isActive ? " site-nav-link-active" : ""}`}
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
