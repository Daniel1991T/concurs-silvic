import type { Progress } from "./store";

/** Câte secțiuni, carduri și grile are un modul (vin de pe server, din conținut). */
export type ModuleCounts = { lesson: number; cards: number; questions: number };

/**
 * Procentul unui modul, ca în aplicația veche: secțiunile citite (30%),
 * cardurile învățate, adică ajunse în cutia 3 sau mai sus (30%), și grilele de test
 * la care ultimul răspuns a fost corect (40%).
 */
export function modulePercent(p: Progress, id: string, c: ModuleCounts) {
  let read = 0;
  for (let i = 0; i < c.lesson; i++) if (p.read[`${id}:${i}`]) read++;
  let known = 0;
  for (let i = 0; i < c.cards; i++) if ((p.cards[`${id}:${i}`]?.box ?? 0) >= 3) known++;
  let mastered = 0;
  for (let i = 0; i < c.questions; i++) if (p.answers[`${id}:${i}`]?.last === 1) mastered++;
  const pct = Math.round(
    100 *
      ((c.lesson ? read / c.lesson : 0) * 0.3 +
        (c.cards ? known / c.cards : 0) * 0.3 +
        (c.questions ? mastered / c.questions : 0) * 0.4),
  );
  return { pct, read, known, mastered };
}
