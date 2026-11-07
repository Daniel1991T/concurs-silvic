import type { Progress } from "./model";

/*
 * Calculele pentru Panou: zile de studiu, timp pe zile, serie, săptămână.
 * Timpul vine din sesiunile cronometrate; o zi contează „de studiu” și dacă ai lucrat
 * fără cronometru (ai citit, ai răspuns la grile, ai repetat carduri).
 */

/** „2026-11-07”, după ora României (ora locală a dispozitivului). */
export function dayKey(ms: number) {
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Ziua cu `offset` zile înainte (negativ) sau după azi, la miezul zilei (evită problemele de la ora de vară). */
export function dayAt(now: number, offset: number) {
  const d = new Date(now);
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return d;
}

/** Minutele cronometrate pe fiecare zi (sesiunea intră în ziua în care a început). */
export function minutesByDay(p: Progress) {
  const out = new Map<string, number>();
  for (const s of Object.values(p.sessions)) {
    const k = dayKey(s.s);
    out.set(k, (out.get(k) ?? 0) + Math.max(0, (s.e - s.s) / 60000));
  }
  return out;
}

/** Zilele în care ai făcut ceva: o sesiune sau orice schimbare de progres. */
export function activeDays(p: Progress) {
  const out = new Set<string>();
  for (const s of Object.values(p.sessions)) out.add(dayKey(s.s));
  // momentele schimbărilor; cele foarte mici sunt date importate fără dată reală
  for (const [k, t] of Object.entries(p.t)) if (t > 1e12 && !k.startsWith("prefs|")) out.add(dayKey(t));
  return out;
}

/** Câte zile la rând, până azi (sau până ieri, dacă azi încă n-ai început). */
export function streak(days: Set<string>, now: number) {
  let n = 0;
  let off = days.has(dayKey(now)) ? 0 : -1;
  while (days.has(dayKey(dayAt(now, off).getTime()))) {
    n++;
    off--;
  }
  return n;
}

/** Minutele din săptămâna curentă (de luni). */
export function weekMinutes(byDay: Map<string, number>, now: number) {
  const d = new Date(now);
  const fromMonday = (d.getDay() + 6) % 7;
  let sum = 0;
  for (let i = 0; i <= fromMonday; i++) sum += byDay.get(dayKey(dayAt(now, -i).getTime())) ?? 0;
  return sum;
}

/** „1 h 35 min”, „40 min”, „2 h”. */
export function formatMinutes(min: number) {
  const m = Math.round(min);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  return m % 60 ? `${h} h ${m % 60} min` : `${h} h`;
}
