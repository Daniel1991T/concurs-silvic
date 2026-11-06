"use client";

import * as Popover from "@radix-ui/react-popover";
import Link from "next/link";
import { createContext, useContext, type ReactNode } from "react";
import type { RefData } from "@/lib/content/ref-data";
import { LawItem } from "./rich";

const RefContext = createContext<RefData | null>(null);

/** Pune la dispoziția cipurilor de pe pagină articolele la care trimit. */
export function RefProvider({ data, children }: { data: RefData; children: ReactNode }) {
  return <RefContext.Provider value={data}>{children}</RefContext.Provider>;
}

/** „^1” din trimiteri se afișează ca exponent: „art. 7¹”. */
export function supRef(s: string) {
  return s.replace(/\^(\d+)/g, (_, d: string) => [...d].map((c) => "⁰¹²³⁴⁵⁶⁷⁸⁹"[+c]).join(""));
}

/**
 * Cipul de trimitere („Cod art. 145 alin. (2)”). La clic se deschide textul articolului,
 * cu alineatul evidențiat; pe telefon, ca o foaie jos pe ecran.
 */
export function RefChip({ refText, className }: { refText: string; className?: string }) {
  const data = useContext(RefContext);
  const targets = data?.refs[refText] ?? [];
  const label = supRef(refText);
  if (!data || targets.length === 0) return <span className={`ref is-plain ${className ?? ""}`}>{label}</span>;
  return (
    <Popover.Root>
      <Popover.Trigger className={`ref ${className ?? ""}`} aria-label={`Textul pentru ${label}`}>
        {label}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="pop" side="bottom" align="start" sideOffset={10} collisionPadding={16}>
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="eyebrow">Textul integral</span>
            <Popover.Close
              className="-my-2 -mr-3 grid size-11 cursor-pointer place-items-center rounded-md text-[1.375rem] hover:bg-surface-2"
              aria-label="Închide"
            >
              ×
            </Popover.Close>
          </div>
          {targets.map(({ anchor, highlight }) => {
            const a = data.articles[anchor];
            return (
              <section key={anchor} className="mb-4 last:mb-0">
                <p className="mb-2 font-mono text-sm leading-tight font-semibold text-brand-text">{a.label}</p>
                <p className="mb-2 text-xs text-text-2">{a.doc}</p>
                {a.items.map(([l, t], i) => (
                  <LawItem key={i} label={l} text={t} highlight={highlight.includes(l)} />
                ))}
                <Link
                  href={`/modul/${data.moduleId}/text#${anchor}`}
                  className="mt-2 inline-flex min-h-11 items-center rounded-md border-[1.5px] border-ctl bg-surface px-4 text-sm font-semibold text-text no-underline hover:bg-surface-2"
                >
                  Deschide articolul
                </Link>
              </section>
            );
          })}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

/** Cipurile de la finalul unui paragraf. */
export function RefList({ refs }: { refs?: string[] }) {
  if (!refs?.length) return null;
  return (
    <span className="ml-2 inline-flex flex-wrap gap-1 align-baseline">
      {refs.map((r) => (
        <RefChip key={r} refText={r} />
      ))}
    </span>
  );
}
