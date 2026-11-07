import Link from "next/link";
import { AccountButton } from "@/components/account/account-button";
import { HammerMark } from "@/components/shell/header";

const navLink =
  "nav-link relative inline-flex min-h-11 items-center rounded-md px-3 text-sm font-semibold text-hdr-fg-2 no-underline hover:bg-white/8 hover:text-hdr-fg md:px-4";

/** Antetul verde al paginii de start și al paginii de intrare (fără bara laterală a aplicației). */
export function LandingHeader({ title }: { title: string }) {
  return (
    <header className="on-dark contours border-b border-hdr-line bg-hdr-bg text-hdr-fg">
      <div className="flex min-h-16 items-center gap-3 px-3 md:min-h-18 md:gap-6 md:px-8">
        <Link href="/" className="flex min-w-0 flex-1 items-center gap-3 text-hdr-fg no-underline md:flex-none">
          <HammerMark className="hidden h-[34px] w-7 flex-none text-hdr-accent md:block" />
          <span className="font-serif text-lg leading-[1.15] font-semibold md:text-[1.375rem] md:whitespace-nowrap">
            {title}
          </span>
        </Link>
        <nav aria-label="Pagina de prezentare" className="hidden md:ml-auto md:flex md:gap-1">
          <Link href="/modul/paza" className={navLink}>
            Cum înveți
          </Link>
          <Link href="/modul/paza/text" className={navLink}>
            Textul legii
          </Link>
          <Link href="/panou" className={navLink}>
            Progres
          </Link>
        </nav>
        <AccountButton />
      </div>
    </header>
  );
}
