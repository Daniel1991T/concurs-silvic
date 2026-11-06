"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Question } from "@/lib/content/schema";
import { recordAnswer, useProgress } from "@/lib/progress/store";
import { cx } from "@/lib/cx";
import { Feedback, Options } from "./options";
import { RefChip } from "./ref-chip";

/**
 * Testul modulului: o grilă pe ecran, cu explicația și sursa după răspuns.
 * Fiecare răspuns se salvează (intră în procentul modulului și în „Greșeli”).
 */
export function Test({ moduleId, questions }: { moduleId: string; questions: Question[] }) {
  const p = useProgress();
  // ordinea grilelor din runda curentă (toate sau doar cele greșite)
  const [order, setOrder] = useState<number[]>(() => questions.map((_, i) => i));
  const [pos, setPos] = useState(0);
  const [picks, setPicks] = useState<Record<number, number>>({});

  const finished = pos >= order.length;
  const qi = order[pos];
  const q = questions[qi];
  const picked = picks[qi] ?? null;
  const right = order.filter((i) => picks[i] !== undefined && picks[i] === questions[i].answer).length;
  const wrong = order.filter((i) => picks[i] !== undefined && picks[i] !== questions[i].answer).length;

  const start = (o: number[]) => {
    setOrder(o);
    setPos(0);
    setPicks({});
  };
  const wrongEver = questions.map((_, i) => i).filter((i) => p.answers[`${moduleId}:${i}`]?.last === 0);

  return (
    <div>
      <div className="mb-4 flex max-w-(--measure) flex-wrap items-center justify-between gap-2">
        <span className="eyebrow">{finished ? "Rezultat" : `Întrebarea ${pos + 1} din ${order.length}`}</span>
        <span className="eyebrow tabular-nums">
          {right} {right === 1 ? "corectă" : "corecte"} · {wrong} {wrong === 1 ? "greșită" : "greșite"}
        </span>
      </div>
      <ol className="qgrid" aria-label="Progresul grilelor">
        {order.map((i, k) => {
          const st = picks[i] === undefined ? "" : picks[i] === questions[i].answer ? "ok" : "err";
          return (
            <li key={i} className={cx(st, k === pos && !finished && "cur")}>
              {k + 1}
              <span className="sr-only">
                {st === "ok" ? " corect" : st === "err" ? " greșit" : k === pos ? " întrebarea curentă" : ""}
              </span>
            </li>
          );
        })}
      </ol>

      {finished ? (
        <div className="max-w-(--measure)">
          <p className="font-serif text-[3rem] leading-none font-semibold tabular-nums">
            {right}
            <span className="text-h3 text-text-2"> / {order.length}</span>
          </p>
          <p className="mt-2 text-text-2">
            {right === order.length ? "Toate corecte." : `Ai greșit ${wrong}. Le găsești și în pagina Greșeli.`}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="primary" onClick={() => start(questions.map((_, i) => i))}>
              Reia testul
            </Button>
            {wrongEver.length > 0 && (
              <Button variant="secondary" onClick={() => start(wrongEver)}>
                Doar cele greșite ({wrongEver.length})
              </Button>
            )}
          </div>
        </div>
      ) : (
        <>
          <p className="qtext">{q.q}</p>
          <Options
            options={q.options}
            answer={q.answer}
            picked={picked}
            onPick={(i) => {
              setPicks((s) => ({ ...s, [qi]: i }));
              recordAnswer(moduleId, qi, i === q.answer);
            }}
          />
          {picked !== null && (
            <Feedback ok={picked === q.answer} explain={q.explain}>
              <p className="fb__src">
                Sursa <RefChip refText={q.ref} />
              </p>
            </Feedback>
          )}
          <div className="mt-8 flex max-w-(--measure) justify-end">
            <Button variant="primary" size="lg" disabled={picked === null} onClick={() => setPos(pos + 1)}>
              {pos === order.length - 1 ? "Vezi rezultatul" : "Următoarea"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
