"use client";

import { createContext, useContext, type ReactNode } from "react";
import { modulePercent, type ModuleCounts } from "@/lib/progress/stats";
import { useProgress } from "@/lib/progress/store";

const CountsContext = createContext<Record<string, ModuleCounts>>({});

/** Câte secțiuni, carduri și grile are fiecare modul; vin o singură dată de pe server. */
export function CountsProvider({ counts, children }: { counts: Record<string, ModuleCounts>; children: ReactNode }) {
  return <CountsContext.Provider value={counts}>{children}</CountsContext.Provider>;
}

/** Procentul unui modul (0 dacă modulul nu are conținut). */
export function useModulePercent(id: string): number {
  const counts = useContext(CountsContext);
  const p = useProgress();
  const c = counts[id];
  return c ? modulePercent(p, id, c).pct : 0;
}

/** Media procentelor unui grup (Codul silvic, Normele tehnice), cu modulele fără conținut la 0. */
export function useGroupPercent(ids: string[]): number {
  const counts = useContext(CountsContext);
  const p = useProgress();
  if (!ids.length) return 0;
  const sum = ids.reduce((a, id) => a + (counts[id] ? modulePercent(p, id, counts[id]).pct : 0), 0);
  return Math.round(sum / ids.length);
}
