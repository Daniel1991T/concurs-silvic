"use client";

import Link from "next/link";
import { useSession } from "@/lib/auth-client";

/** Butonul de cont din antet: inițiala ta dacă ești logat, altfel o siluetă. */
export function AccountButton() {
  const { data } = useSession();
  const name = data?.user.name || data?.user.email || "";
  return (
    <Link
      href="/cont"
      className="grid size-11 flex-none place-items-center rounded-md border-[1.5px] border-hdr-line bg-white/6 font-serif text-lg font-semibold text-hdr-fg no-underline hover:bg-white/12"
      aria-label={data ? `Contul tău (${name})` : "Intră în cont"}
    >
      {data ? (
        name.slice(0, 1).toUpperCase()
      ) : (
        <svg
          className="size-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="8" r="4" />
          <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
        </svg>
      )}
    </Link>
  );
}
