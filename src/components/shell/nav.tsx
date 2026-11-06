"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/lib/cx";

export const NAV = [
  { href: "/", label: "Module" },
  { href: "/panou", label: "Panou" },
  { href: "/simulare", label: "Simulare" },
  { href: "/greseli", label: "Greșeli" },
] as const;

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === "/") return pathname === "/" || pathname.startsWith("/modul/");
  return pathname === href || pathname.startsWith(href + "/");
}

const linkClass =
  "nav-link relative inline-flex min-h-11 items-center justify-center rounded-md px-0.5 text-[0.875rem] font-semibold " +
  "text-hdr-fg-2 no-underline hover:bg-white/8 hover:text-hdr-fg aria-[current=page]:text-hdr-fg md:px-4 md:text-sm";

export function NavLinks() {
  const pathname = usePathname();
  return NAV.map((n) => (
    <Link
      key={n.href}
      href={n.href}
      className={linkClass}
      aria-current={isActive(pathname, n.href) ? "page" : undefined}
    >
      {n.label}
    </Link>
  ));
}

/** Varianta fără pagina curentă, afișată cât timp se rezolvă adresa. */
export function NavLinksFallback() {
  return NAV.map((n) => (
    <Link key={n.href} href={n.href} className={cx(linkClass)}>
      {n.label}
    </Link>
  ));
}
