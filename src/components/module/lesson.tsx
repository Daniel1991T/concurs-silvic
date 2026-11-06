"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import type { Section } from "@/lib/content/schema";
import { answerMini, resetMini, setPos, setRead, useProgress } from "@/lib/progress/store";
import { cx } from "@/lib/cx";
import { Figure } from "./figure";
import { Feedback, Options } from "./options";
import { RefChip, RefList } from "./ref-chip";
import { Rich } from "./rich";

const stripNo = (t: string) => t.replace(/^\d+\.\s*/, "");

function Check() {
  return (
    <svg
      viewBox="0 0 20 20"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 10.5l4 4 8-9" />
    </svg>
  );
}

/** Lecția: stepper pe secțiuni, textul secțiunii, „De reținut”, figura și mini-grilele. */
export function Lesson({ moduleId, intro, sections }: { moduleId: string; intro: string; sections: Section[] }) {
  const p = useProgress();
  const top = useRef<HTMLDivElement>(null);
  const n = sections.length;
  const cur = Math.min(p.pos[moduleId] ?? 0, n - 1);
  const s = sections[cur];
  const isRead = (i: number) => !!p.read[`${moduleId}:${i}`];

  const go = (i: number) => {
    setPos(moduleId, i);
    top.current?.scrollIntoView({ block: "start" });
  };

  return (
    <div ref={top} className="scroll-mt-40">
      <ol className={cx("stepper", n > 7 && "is-dense")} aria-label="Secțiunile lecției">
        {sections.map((x, i) => {
          const done = isRead(i);
          const current = i === cur;
          const title = stripNo(x.title);
          return (
            <li key={i} className={cx("step", done && !current && "is-done", current && "is-current")}>
              <button
                type="button"
                className="step__b"
                onClick={() => go(i)}
                aria-current={current ? "step" : undefined}
                aria-label={`${i + 1}. ${title}${done ? ", parcursă" : ""}${current ? ", secțiunea curentă" : ""}`}
              >
                {done && !current ? <Check /> : i + 1}
              </button>
              <span className="step__l">{title}</span>
            </li>
          );
        })}
      </ol>

      {cur === 0 && (
        <p className="mb-8 max-w-(--measure) text-text-2">
          <Rich text={intro} />
        </p>
      )}

      <article className="prose">
        <h3>
          <span className="no">
            Secțiunea {cur + 1} din {n}
          </span>
          {stripNo(s.title)}
        </h3>
        {s.paragraphs.map((para, i) => (
          <p key={i}>
            <Rich text={para.text} />
            <RefList refs={para.refs} />
          </p>
        ))}
      </article>

      {s.figure && <Figure fig={s.figure} />}

      {s.keep.length > 0 && (
        <div className="note">
          <span className="note__tag">De reținut</span>
          <ul className="list-disc space-y-1 pl-5">
            {s.keep.map((k, i) => (
              <li key={i}>
                <Rich text={k} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {s.quiz.map((q, j) => {
        const key = `${moduleId}:${cur}:${j}`;
        const a = p.mini[key];
        return (
          <div key={key} className="mini">
            <p className="eyebrow">Mini-grilă {s.quiz.length > 1 ? `${j + 1} din ${s.quiz.length}` : ""}</p>
            <p className="mini__q">{q.q}</p>
            <Options
              compact
              options={q.options}
              answer={q.answer}
              picked={a ? a.pick : null}
              onPick={(pick) => {
                const ok = pick === q.answer;
                const allOk = s.quiz.every((_, k) => (k === j ? ok : p.mini[`${moduleId}:${cur}:${k}`]?.ok));
                answerMini(moduleId, cur, j, pick, ok, allOk);
              }}
            />
            {a && (
              <Feedback ok={a.ok} explain={q.explain}>
                <p className="fb__src">
                  Sursa <RefChip refText={q.ref} />
                </p>
                {!a.ok && (
                  <Button variant="ghost" className="mt-2" onClick={() => resetMini(moduleId, cur, j)}>
                    Încearcă din nou
                  </Button>
                )}
              </Feedback>
            )}
          </div>
        );
      })}

      <div className="stepper-nav">
        <Button variant="secondary" disabled={cur === 0} onClick={() => go(cur - 1)}>
          Înapoi
        </Button>
        <label className="check">
          <input type="checkbox" checked={isRead(cur)} onChange={(e) => setRead(moduleId, cur, e.target.checked)} />
          <span>Secțiunea parcursă</span>
        </label>
        {cur < n - 1 ? (
          <Button
            variant="primary"
            onClick={() => {
              setRead(moduleId, cur, true);
              go(cur + 1);
            }}
          >
            Următoarea secțiune
          </Button>
        ) : (
          <Button variant="primary" disabled={isRead(cur)} onClick={() => setRead(moduleId, cur, true)}>
            {isRead(cur) ? "Lecție terminată" : "Termină lecția"}
          </Button>
        )}
      </div>
    </div>
  );
}
