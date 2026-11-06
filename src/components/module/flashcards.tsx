"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { gradeCard, useProgress, useToday } from "@/lib/progress/store";
import { cx } from "@/lib/cx";
import { RefChip } from "./ref-chip";

type Card = { q: string; a: string; ref: string };

/**
 * Flashcards cu cutii Leitner. Implicit vezi cardurile de repetat azi (cele noi și
 * cele care au revenit); apăsând pe o cutie le vezi doar pe cele din ea.
 * „Știam” mută cardul în cutia următoare (revine mai târziu), „Nu știam” îl trimite în cutia 1.
 */
export function Flashcards({ moduleId, cards }: { moduleId: string; cards: Card[] }) {
  const p = useProgress();
  const today = useToday();
  const [box, setBox] = useState<number | null>(null);
  const [flipped, setFlipped] = useState(false);
  // cardurile notate în sesiunea asta nu mai apar până la schimbarea filtrului
  const [doneNow, setDoneNow] = useState<Set<number>>(new Set());

  const st = (i: number) => p.cards[`${moduleId}:${i}`];
  const boxOf = (i: number) => st(i)?.box ?? 1;
  const counts = [1, 2, 3, 4, 5].map((b) => cards.filter((_, i) => boxOf(i) === b).length);

  const queue = cards
    .map((_, i) => i)
    .filter((i) => !doneNow.has(i))
    .filter((i) => (box === null ? (today === null ? true : (st(i)?.due ?? 0) <= today) : boxOf(i) === box))
    .sort((a, b) => boxOf(a) - boxOf(b));
  const i = queue[0];
  const card = i === undefined ? null : cards[i];

  const pickBox = (b: number | null) => {
    setBox(b);
    setFlipped(false);
    setDoneNow(new Set());
  };
  const grade = (knew: boolean) => {
    if (i === undefined) return;
    gradeCard(moduleId, i, knew);
    setDoneNow((s) => new Set(s).add(i));
    setFlipped(false);
  };

  return (
    <div className="pt-2">
      <p className="eyebrow mb-3 text-center">Cutiile Leitner</p>
      <div className="leitner" role="group" aria-label="Cutiile Leitner 1–5">
        {counts.map((c, k) => (
          <button
            key={k}
            type="button"
            className="box"
            aria-pressed={box === k + 1}
            onClick={() => pickBox(box === k + 1 ? null : k + 1)}
            aria-label={`Cutia ${k + 1}: ${c} carduri`}
          >
            <b>{k + 1}</b>
            <small className="tabular-nums">{c}</small>
          </button>
        ))}
      </div>

      <p className="mb-4 text-center text-sm text-text-2">
        {box === null ? `De repetat azi: ${queue.length}` : `Cutia ${box}: ${queue.length} carduri rămase`}
        {box !== null && (
          <button
            type="button"
            className="ml-2 cursor-pointer font-semibold text-brand-text underline"
            onClick={() => pickBox(null)}
          >
            înapoi la cele de azi
          </button>
        )}
      </p>

      {card ? (
        <>
          <div className={cx("fc", flipped && "is-flipped")}>
            <button
              type="button"
              className="fc__in"
              onClick={() => setFlipped((f) => !f)}
              aria-label={flipped ? "Întoarce cardul la întrebare" : "Întoarce cardul la răspuns"}
            >
              <span className="fc__f" aria-hidden={flipped}>
                <span className="fc__tag">Întrebare</span>
                <span className="fc__q">{card.q}</span>
                <span className="fc__hint">Apasă pe card ca să-l întorci</span>
              </span>
              <span className="fc__b" aria-hidden={!flipped}>
                <span className="fc__tag">Răspuns</span>
                <span className="fc__a">{card.a}</span>
              </span>
            </button>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {flipped ? (
              <>
                <Button variant="secondary" size="lg" onClick={() => grade(false)}>
                  Nu știam
                </Button>
                <Button variant="primary" size="lg" onClick={() => grade(true)}>
                  Știam
                </Button>
              </>
            ) : (
              <Button variant="primary" size="lg" onClick={() => setFlipped(true)}>
                Arată răspunsul
              </Button>
            )}
          </div>
          <p className="mt-4 text-center text-sm text-text-2">
            Sursa <RefChip refText={card.ref} /> · cutia {boxOf(i!)}
          </p>
        </>
      ) : (
        <div className="mx-auto max-w-[640px] rounded-lg border border-line bg-bg px-6 py-10 text-center">
          <p className="font-serif text-lg font-semibold">
            {box === null ? "Ai terminat cardurile de azi" : `Nicio carte rămasă în cutia ${box}`}
          </p>
          <p className="mt-2 text-text-2">Cardurile știute revin după 1, 3, 7 sau 14 zile, după cutie.</p>
          <Button variant="secondary" className="mt-4" onClick={() => pickBox(1)}>
            Repetă cutia 1
          </Button>
        </div>
      )}
    </div>
  );
}
