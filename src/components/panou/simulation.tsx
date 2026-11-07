"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Feedback, Options } from "@/components/module/options";
import { supRef } from "@/components/module/ref-chip";
import { Button } from "@/components/ui/button";
import type { QuestionLite } from "@/lib/content";
import { cx } from "@/lib/cx";
import { finishSimulation, useProgress } from "@/lib/progress/store";
import { formatMinutes } from "@/lib/progress/study";
import type { PanouModule } from "./panou";

/*
 * Simularea de examen: grile amestecate din toate modulele, cu timp limită.
 * Răspunsurile se văd abia la final, ca la examen; atunci intră și în progres
 * (testul modulelor și pagina Greșeli).
 */

const SIZES = [
  { n: 20, min: 30 },
  { n: 30, min: 45 },
  { n: 50, min: 75 },
];

type Run = { start: number; ends: number; items: QuestionLite[]; picks: Record<number, number>; pos: number };

function shuffle<T>(a: T[]) {
  const b = a.slice();
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
}

function clock(ms: number) {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

/** O simulare nouă: grilele amestecate și momentul în care se termină timpul. */
function newRun(questions: QuestionLite[], n: number, min: number): Run {
  const t = Date.now();
  return { start: t, ends: t + min * 60000, items: shuffle(questions).slice(0, n), picks: {}, pos: 0 };
}

/** Salvează simularea terminată în progres (răspunsurile și rezultatul). */
function saveRun(r: Run) {
  const at = Date.now();
  // în progres intră doar grilele la care ai răspuns; cele sărite nu ajung la Greșeli
  const answers = r.items.flatMap((q, i) =>
    r.picks[i] === undefined ? [] : [{ m: q.m, i: q.i, ok: r.picks[i] === q.a }],
  );
  finishSimulation(r.start, r.items.length, answers, at - r.start);
  return { ...r, finishedAt: at };
}

export function Simulation({ questions, modules }: { questions: QuestionLite[]; modules: PanouModule[] }) {
  const p = useProgress();
  const [run, setRun] = useState<Run | null>(null);
  const [result, setResult] = useState<(Run & { finishedAt: number }) | null>(null);
  const [now, setNow] = useState(0);
  const title = new Map(modules.map((m) => [m.id, m.title]));

  const finish = (r: Run) => {
    setResult(saveRun(r));
    setRun(null);
  };

  // ceasul simulării; la zero, simularea se încheie singură
  useEffect(() => {
    if (!run) return;
    const tick = () => {
      const t = Date.now();
      setNow(t);
      if (t >= run.ends) finish(run);
    };
    const first = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(id);
    };
  }, [run]);

  const start = (n: number, min: number) => {
    setResult(null);
    setRun(newRun(questions, n, min));
  };

  /* ---------- rezultatul ---------- */
  if (result) {
    const ok = result.items.filter((q, i) => result.picks[i] === q.a).length;
    const pct = Math.round((100 * ok) / result.items.length);
    const wrongItems = result.items.map((q, i) => ({ q, pick: result.picks[i] })).filter((x) => x.pick !== x.q.a);
    return (
      <div className="sheet">
        <p className="eyebrow">Rezultat</p>
        <p className="mt-2 font-serif text-[3.5rem] leading-none font-semibold tabular-nums">
          {pct}%
          <span className="ml-3 text-h3 text-text-2">
            {ok} din {result.items.length}
          </span>
        </p>
        <p className="mt-2 text-text-2">
          Timp: {formatMinutes((result.finishedAt - result.start) / 60000)}.{" "}
          {pct >= 70 ? "Peste pragul obișnuit de promovare." : "Sub pragul obișnuit de 70%."}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button variant="primary" onClick={() => setResult(null)}>
            Simulare nouă
          </Button>
          <Link href="/greseli" className="inline-flex min-h-11 items-center px-2 font-semibold text-brand-text">
            Refă greșelile →
          </Link>
        </div>
        {wrongItems.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-4 font-serif text-h3 font-semibold">Unde ai greșit ({wrongItems.length})</h2>
            <ol className="space-y-8">
              {wrongItems.map(({ q, pick }) => (
                <li key={`${q.m}:${q.i}`}>
                  <p className="eyebrow mb-2">{title.get(q.m)}</p>
                  <p className="qtext mb-4! text-lg!">{q.q}</p>
                  <Options compact options={q.o} answer={q.a} picked={pick ?? -1} onPick={() => {}} />
                  <Feedback ok={false} explain={pick === undefined ? `Fără răspuns. ${q.e}` : q.e}>
                    <p className="fb__src">
                      Sursa{" "}
                      <Link href={`/modul/${q.m}/test`} className="ref">
                        {supRef(q.r)}
                      </Link>
                    </p>
                  </Feedback>
                </li>
              ))}
            </ol>
          </section>
        )}
      </div>
    );
  }

  /* ---------- alegerea simulării ---------- */
  if (!run) {
    const past = Object.entries(p.sims)
      .sort((a, b) => Number(b[0]) - Number(a[0]))
      .slice(0, 5);
    return (
      <>
        <p className="mb-6 max-w-[62ch] text-text-2">
          Grile amestecate din toate cele {modules.length} module, cu timp limită (un minut și jumătate pe grilă).
          Răspunsurile se văd abia la final. Ai {questions.length} de grile în total.
        </p>
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {SIZES.map((s) => (
            <button
              key={s.n}
              type="button"
              onClick={() => start(s.n, s.min)}
              className="card cursor-pointer text-left hover:border-brand"
            >
              <span className="block font-serif text-[2.5rem] leading-none font-semibold">{s.n}</span>
              <span className="mt-1 block font-semibold">grile</span>
              <span className="mt-2 block font-mono text-xs tracking-[0.1em] text-text-2 uppercase">
                {s.min} de minute
              </span>
            </button>
          ))}
        </div>
        {past.length > 0 && (
          <section className="card max-w-xl">
            <div className="card__h">
              <h2>Ultimele simulări</h2>
            </div>
            <ul className="sess">
              {past.map(([id, s]) => (
                <li key={id}>
                  <span>
                    <b className="font-semibold">
                      {new Date(Number(id)).toLocaleDateString("ro-RO", {
                        weekday: "long",
                        day: "numeric",
                        month: "short",
                      })}
                    </b>
                    <small>
                      {s.ok} din {s.n} · {formatMinutes(s.dur / 60000)}
                    </small>
                  </span>
                  <span className="t">{Math.round((100 * s.ok) / s.n)}%</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </>
    );
  }

  /* ---------- simularea în curs ---------- */
  const q = run.items[run.pos];
  const left = now ? run.ends - now : run.ends - run.start;
  const answeredCount = Object.keys(run.picks).length;
  const set = (patch: Partial<Run>) => setRun({ ...run, ...patch });
  return (
    <div className="sheet">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <span className="eyebrow">
          Grila {run.pos + 1} din {run.items.length} · {title.get(q.m)}
        </span>
        <span
          className={cx("font-mono text-lg font-semibold tabular-nums", left < 5 * 60000 && "text-accent-text")}
          role="timer"
          aria-label="Timp rămas"
        >
          {clock(left)}
        </span>
      </div>
      <ol className="qgrid" aria-label="Grilele simulării">
        {run.items.map((_, i) => (
          <li key={i} className={cx(run.picks[i] !== undefined && "ok", i === run.pos && "cur")}>
            <button
              type="button"
              className="size-full cursor-pointer"
              onClick={() => set({ pos: i })}
              aria-label={`Grila ${i + 1}${run.picks[i] !== undefined ? ", răspunsă" : ""}`}
            >
              {i + 1}
            </button>
          </li>
        ))}
      </ol>
      <p className="qtext">{q.q}</p>
      {/* la simulare nu se arată corect/greșit: varianta aleasă se marchează doar ca „aleasă” */}
      <div className="opts" role="radiogroup" aria-label="Variante de răspuns">
        {q.o.map((o, i) => (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={run.picks[run.pos] === i}
            className={cx("opt", run.picks[run.pos] === i && "border-brand! bg-brand-soft!")}
            onClick={() => set({ picks: { ...run.picks, [run.pos]: i } })}
          >
            <span className={cx("opt__k", run.picks[run.pos] === i && "border-brand bg-brand text-brand-ink")}>
              {"ABCDEF"[i]}
            </span>
            <span className="opt__t">{o}</span>
            <span />
          </button>
        ))}
      </div>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <Button variant="secondary" disabled={run.pos === 0} onClick={() => set({ pos: run.pos - 1 })}>
          Înapoi
        </Button>
        <span className="text-sm text-text-2">
          {answeredCount} din {run.items.length} răspunse
        </span>
        {run.pos < run.items.length - 1 ? (
          <Button variant="primary" onClick={() => set({ pos: run.pos + 1 })}>
            Următoarea
          </Button>
        ) : (
          <Button variant="accent" onClick={() => finish(run)}>
            Termină simularea
          </Button>
        )}
      </div>
      {run.pos < run.items.length - 1 && (
        <p className="mt-4 text-right">
          <button
            type="button"
            className="cursor-pointer text-sm font-semibold text-accent-text underline"
            onClick={() => finish(run)}
          >
            Termină acum
          </button>
        </p>
      )}
    </div>
  );
}
