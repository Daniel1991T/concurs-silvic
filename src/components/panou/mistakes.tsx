"use client";

import Link from "next/link";
import { useState } from "react";
import { Feedback, Options } from "@/components/module/options";
import { supRef } from "@/components/module/ref-chip";
import { EmptyState } from "@/components/ui/page-head";
import type { QuestionLite } from "@/lib/content";
import { recordAnswer, useProgress } from "@/lib/progress/store";
import type { PanouModule } from "./panou";

/** O grilă greșită: o refaci pe loc; dacă răspunzi corect, iese din listă la următoarea vizită. */
function MistakeItem({ q, onAnswer }: { q: QuestionLite; onAnswer: () => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  return (
    <li className="border-t border-line pt-6 first:border-t-0 first:pt-0">
      <p className="mb-4 font-serif text-lg leading-snug font-medium">{q.q}</p>
      <Options
        compact
        options={q.o}
        answer={q.a}
        picked={picked}
        onPick={(i) => {
          setPicked(i);
          onAnswer();
          recordAnswer(q.m, q.i, i === q.a);
        }}
      />
      {picked !== null && (
        <Feedback ok={picked === q.a} explain={picked === q.a ? `Bravo, iese din greșeli. ${q.e}` : q.e}>
          <p className="fb__src">
            Sursa{" "}
            <Link href={`/modul/${q.m}/test`} className="ref">
              {supRef(q.r)}
            </Link>
          </p>
          {picked !== q.a && (
            <button
              type="button"
              className="mt-2 min-h-11 cursor-pointer font-semibold text-brand-text underline"
              onClick={() => setPicked(null)}
            >
              Încearcă din nou
            </button>
          )}
        </Feedback>
      )}
    </li>
  );
}

/** Pagina Greșeli: grilele la care ultimul tău răspuns a fost greșit, pe module. */
export function Mistakes({ questions, modules }: { questions: QuestionLite[]; modules: PanouModule[] }) {
  const p = useProgress();
  // grilele la care ai răspuns acum rămân pe pagină (cu explicația), chiar dacă le-ai refăcut corect
  const [kept, setKept] = useState<Set<string>>(new Set());
  const wrong = questions.filter((q) => {
    const k = `${q.m}:${q.i}`;
    return p.answers[k]?.last === 0 || kept.has(k);
  });
  if (!wrong.length) {
    return (
      <EmptyState title="Nicio greșeală de refăcut">
        Aici apar grilele la care ultimul tău răspuns a fost greșit, din test, din simulări și de aici. Când le răspunzi
        corect, dispar.
      </EmptyState>
    );
  }
  const groups = modules.map((m) => ({ m, items: wrong.filter((q) => q.m === m.id) })).filter((g) => g.items.length);
  return (
    <>
      <p className="mb-6 text-text-2">
        {wrong.length} {wrong.length === 1 ? "grilă" : "grile"} în {groups.length}{" "}
        {groups.length === 1 ? "modul" : "module"}. Răspunde din nou; cele corecte ies din listă.
      </p>
      <div className="space-y-6">
        {groups.map(({ m, items }) => (
          <section key={m.id} className="sheet">
            <h2 className="mb-6 flex flex-wrap items-baseline justify-between gap-2 font-serif text-h3 font-semibold">
              {m.title}
              <span className="eyebrow">{items.length} de refăcut</span>
            </h2>
            <ol className="space-y-6">
              {items.map((q) => (
                <MistakeItem
                  key={`${q.m}:${q.i}`}
                  q={q}
                  onAnswer={() => setKept((s) => new Set(s).add(`${q.m}:${q.i}`))}
                />
              ))}
            </ol>
          </section>
        ))}
      </div>
    </>
  );
}
