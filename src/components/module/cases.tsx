"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefChip } from "./ref-chip";

type Case = { title: string; situation: string; steps: Array<{ q: string; a: string; ref: string }> };

/** O situație din teren: întrebările vin pe rând, iar răspunsul se arată la cerere. */
function CaseCard({ c, n }: { c: Case; n: number }) {
  const [shown, setShown] = useState(0);
  return (
    <section className="max-w-(--measure) rounded-lg border border-line bg-bg p-5 md:p-6">
      <p className="eyebrow">Situația {n}</p>
      <h3 className="mt-1 font-serif text-h3 leading-tight font-semibold">{c.title}</h3>
      <p className="mt-3 text-read leading-[1.65]">{c.situation}</p>
      <ol className="mt-5 space-y-4">
        {c.steps.slice(0, shown + 1).map((s, i) => (
          <li key={i} className="border-t border-line pt-4">
            <p className="font-semibold">
              <span className="mr-2 font-mono text-sm text-accent-text">{i + 1}.</span>
              {s.q}
            </p>
            {i < shown ? (
              <div className="mt-2 rounded-md border border-brand/40 bg-brand-soft px-4 py-3">
                <p>{s.a}</p>
                <p className="mt-2">
                  <RefChip refText={s.ref} />
                </p>
              </div>
            ) : (
              <Button variant="ghost" className="mt-1 -ml-4" onClick={() => setShown(i + 1)}>
                Arată răspunsul
              </Button>
            )}
          </li>
        ))}
      </ol>
      {shown >= c.steps.length && (
        <Button variant="secondary" className="mt-4" onClick={() => setShown(0)}>
          Reia situația
        </Button>
      )}
    </section>
  );
}

export function Cases({ cases }: { cases: Case[] }) {
  if (!cases.length) return <p className="text-text-2">Modulul nu are situații din teren.</p>;
  return (
    <div className="space-y-6">
      <p className="max-w-(--measure) text-text-2">
        Cazuri cum le-ai întâlni în ocol. Gândește-te la răspuns înainte să-l deschizi.
      </p>
      {cases.map((c, i) => (
        <CaseCard key={i} c={c} n={i + 1} />
      ))}
    </div>
  );
}
