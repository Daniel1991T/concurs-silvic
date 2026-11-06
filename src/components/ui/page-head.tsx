import type { ReactNode } from "react";

/** Titlul unei pagini (Panou, Simulare, Greșeli…), cu o zonă opțională în dreapta. */
export function PageHead({ title, eyebrow, children }: { title: string; eyebrow?: string; children?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-4 md:mb-6">
      <div>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h1 className="font-serif text-[1.875rem] leading-[1.1] font-semibold tracking-[-0.015em] md:text-h1">
          {title}
        </h1>
      </div>
      {children}
    </div>
  );
}

/** Ecran gol cu curbe de nivel discrete, pentru pagini încă neconstruite. */
export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="contours contours-soft rounded-lg border border-line bg-surface px-6 py-12 shadow-card md:px-12 md:py-16">
      <h2 className="font-serif text-lg font-semibold">{title}</h2>
      {children && <div className="mt-2 max-w-[60ch] text-text-2">{children}</div>}
    </div>
  );
}
