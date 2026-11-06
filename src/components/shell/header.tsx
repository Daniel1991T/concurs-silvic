import Link from "next/link";
import { Suspense } from "react";
import { DrawerButton } from "./sidebar-client";
import { NavLinks, NavLinksFallback } from "./nav";
import { ThemeToggle } from "./theme-toggle";
import { TimerMini } from "./timer-mini";

/** Amprenta ciocanului silvic, semnul aplicației. */
export function HammerMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 40" aria-hidden="true">
      <path d="M4 4h19l5 3v8l-5 3H4z M12 18h6v19a3 3 0 0 1-6 0z" fill="currentColor" />
    </svg>
  );
}

/*
 * Antetul fix, verde de pădure, cu curbe de nivel.
 * Desktop: semn · titlu · navigare · cronometru · temă.
 * Telefon: titlu + cronometru + temă pe primul rând; „☰ Lecții” + navigarea pe al doilea.
 */
export function Header({ title }: { title: string }) {
  return (
    <header className="on-dark contours sticky top-0 z-20 border-b border-hdr-line bg-hdr-bg text-hdr-fg">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-3 pt-2 md:min-h-18 md:flex-nowrap md:gap-6 md:px-8 md:pt-0">
        <Link href="/" className="order-1 flex min-w-0 flex-1 items-center gap-3 text-hdr-fg no-underline md:flex-none">
          <HammerMark className="hidden h-[34px] w-7 flex-none text-hdr-accent md:block" />
          <span className="font-serif text-lg leading-[1.15] font-semibold tracking-[-0.005em] md:text-[1.375rem] md:whitespace-nowrap">
            {title}
          </span>
        </Link>

        <nav
          aria-label="Principal"
          className="order-3 grid w-full grid-cols-[auto_repeat(4,minmax(0,1fr))] items-center md:order-2 md:ml-auto md:flex md:w-auto md:gap-1"
        >
          <DrawerButton />
          <Suspense fallback={<NavLinksFallback />}>
            <NavLinks />
          </Suspense>
        </nav>

        <div className="order-2 flex items-center gap-2 md:order-3">
          <TimerMini />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
