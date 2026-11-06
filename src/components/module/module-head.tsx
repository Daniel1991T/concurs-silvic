"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useModulePercent } from "@/components/shell/progress-context";
import { Bar } from "@/components/ui/bar";
import { Stamp } from "@/components/ui/stamp";

/** Titlul modulului: ștampila mare cu progresul, titlul și bara. */
export function ModuleHead({ id, abbr, title, eyebrow }: { id: string; abbr: string; title: string; eyebrow: string }) {
  const pct = useModulePercent(id);
  return (
    <div className="mb-5 flex items-center gap-4 md:mb-8 md:gap-6">
      <Stamp abbr={abbr} progress={pct} size={72} className="md:[--sz:92px]!" />
      <div className="min-w-0 flex-1">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-1 font-serif text-[1.75rem] leading-[1.1] font-semibold tracking-[-0.015em] md:text-h1">
          {title}
        </h1>
        <div className="mt-3 flex items-center gap-3 md:max-w-90">
          <Bar value={pct} size="lg" className="flex-1" label="Progresul modulului" />
          <span className="font-mono text-sm leading-none font-medium tabular-nums">{pct}%</span>
        </div>
      </div>
    </div>
  );
}

export const TABS = [
  { seg: "", label: "Lecția" },
  { seg: "fisa", label: "Fișa de memorat" },
  { seg: "carduri", label: "Flashcards" },
  { seg: "situatii", label: "Situații din teren" },
  { seg: "test", label: "Test" },
  { seg: "text", label: "Textul oficial" },
] as const;

/** Filele modulului, ca filele unui carnet: fila activă se unește cu foaia de dedesubt. */
export function ModuleTabs({ id }: { id: string }) {
  const pathname = usePathname();
  return (
    <nav className="tabs" aria-label="Filele modulului">
      {TABS.map((t) => {
        const href = t.seg ? `/modul/${id}/${t.seg}` : `/modul/${id}`;
        return (
          <Link
            key={t.seg}
            href={href}
            className="tab"
            aria-current={pathname === href ? "page" : undefined}
            scroll={false}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
