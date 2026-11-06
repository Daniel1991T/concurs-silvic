import type { CSSProperties } from "react";
import type { Figure as FigureData } from "@/lib/content/schema";
import { RefChip } from "./ref-chip";

/** Figurile din lecție: flux de pași, grilă de casete sau scară de competențe. */
export function Figure({ fig }: { fig: FigureData }) {
  if (fig.type === "flow") {
    const long = fig.steps.length > 4;
    return (
      <figure className="fig">
        <figcaption>{fig.title}</figcaption>
        <ol className={`flow${long ? " is-long" : ""}`} style={{ "--n": fig.steps.length } as CSSProperties}>
          {fig.steps.map((s, i) => (
            <li key={i}>
              <b className="block font-semibold">{s.title}</b>
              <span className="block text-xs text-text-2">{s.text}</span>
              <span className="mt-1 block">
                <RefChip refText={s.ref} className="text-[0.72rem]" />
              </span>
            </li>
          ))}
        </ol>
      </figure>
    );
  }
  if (fig.type === "grid") {
    return (
      <figure className="fig">
        <figcaption>{fig.title}</figcaption>
        <ul className="grid gap-3 sm:grid-cols-2">
          {fig.items.map((s, i) => (
            <li key={i} className="rounded-md border border-line bg-bg px-4 py-3">
              <p className="font-semibold leading-snug">{s.title}</p>
              <p className="mt-1 text-sm leading-normal text-text-2">{s.text}</p>
              <p className="mt-2">
                <RefChip refText={s.ref} className="text-[0.72rem]" />
              </p>
            </li>
          ))}
        </ul>
      </figure>
    );
  }
  // scara: de sus (cel mai înalt nivel) în jos
  return (
    <figure className="fig">
      <figcaption>{fig.title}</figcaption>
      <ol className="overflow-hidden rounded-md border border-line bg-bg">
        {fig.levels.map((l, i) => (
          <li
            key={i}
            className="grid grid-cols-[34px_minmax(0,1fr)] gap-3 border-t border-line px-4 py-3 first:border-t-0"
          >
            <span className="grid size-[34px] place-items-center rounded-full border-2 border-brand font-mono text-sm font-semibold text-brand-text">
              {i + 1}
            </span>
            <div className="min-w-0">
              <p className="flex flex-wrap items-baseline gap-x-2 font-semibold leading-snug">
                {l.who}
                <RefChip refText={l.ref} className="text-[0.72rem]" />
              </p>
              <ul className="mt-1 list-disc pl-5 text-sm leading-normal text-text-2">
                {l.does.map((d, j) => (
                  <li key={j}>{d}</li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </figure>
  );
}
