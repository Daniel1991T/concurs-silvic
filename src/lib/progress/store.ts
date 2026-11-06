"use client";

import { useSyncExternalStore } from "react";

/*
 * Progresul tău: secțiuni citite, mini-grile, răspunsuri la test, cutiile cardurilor.
 * Deocamdată se ține în browser (localStorage). În etapa 4 același API se
 * sincronizează cu baza de date, deci componentele nu se schimbă.
 */

export type Progress = {
  /** `${modul}:${secțiune}` → secțiunea e parcursă */
  read: Record<string, true>;
  /** `${modul}:${secțiune}:${grilă}` → răspunsul la mini-grila din lecție */
  mini: Record<string, { pick: number; ok: boolean }>;
  /** `${modul}:${grilă}` → istoricul la test: de câte ori, câte corecte, ultimul răspuns */
  answers: Record<string, { n: number; ok: number; last: 0 | 1 }>;
  /** `${modul}:${card}` → cutia Leitner (1–5) și ziua în care cardul revine */
  cards: Record<string, { box: number; due: number }>;
  /** secțiunea la care ai rămas, pe modul */
  pos: Record<string, number>;
};

const KEY = "cs-progress-v1";
const EMPTY: Progress = { read: {}, mini: {}, answers: {}, cards: {}, pos: {} };
const listeners = new Set<() => void>();
let cached: Progress | null = null;

function load(): Progress {
  if (cached) return cached;
  try {
    const raw = localStorage.getItem(KEY);
    cached = raw ? { ...EMPTY, ...(JSON.parse(raw) as Partial<Progress>) } : EMPTY;
  } catch {
    cached = EMPTY;
  }
  return cached;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  // alt tab a schimbat progresul: recitim
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cached = null;
      cb();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

/** Modifică progresul printr-o funcție care primește o copie și o întoarce schimbată. */
export function updateProgress(fn: (p: Progress) => Progress) {
  cached = fn(load());
  try {
    localStorage.setItem(KEY, JSON.stringify(cached));
  } catch {}
  listeners.forEach((l) => l());
}

/** Progresul curent. Pe server (și la prima randare) e gol, apoi se citește din browser. */
export function useProgress(): Progress {
  return useSyncExternalStore(subscribe, load, () => EMPTY);
}

/* ---------- ziua de azi, ca număr (zile de la 1970), doar în browser ---------- */
const dayNow = () => Math.floor(Date.now() / 864e5);
const noop = () => () => {};
/** null la randarea pe server, apoi ziua curentă. */
export function useToday(): number | null {
  return useSyncExternalStore(noop, dayNow, () => null);
}

/* ---------- acțiuni ---------- */

export function setRead(mod: string, sec: number, value: boolean) {
  updateProgress((p) => {
    const read = { ...p.read };
    if (value) read[`${mod}:${sec}`] = true;
    else delete read[`${mod}:${sec}`];
    return { ...p, read };
  });
}

export function setPos(mod: string, sec: number) {
  updateProgress((p) => ({ ...p, pos: { ...p.pos, [mod]: sec } }));
}

export function answerMini(mod: string, sec: number, q: number, pick: number, ok: boolean, allOkAfter: boolean) {
  updateProgress((p) => {
    const next = { ...p, mini: { ...p.mini, [`${mod}:${sec}:${q}`]: { pick, ok } } };
    // toate mini-grilele secțiunii corecte → secțiunea se bifează singură
    if (allOkAfter) next.read = { ...p.read, [`${mod}:${sec}`]: true };
    return next;
  });
}

export function resetMini(mod: string, sec: number, q: number) {
  updateProgress((p) => {
    const mini = { ...p.mini };
    delete mini[`${mod}:${sec}:${q}`];
    return { ...p, mini };
  });
}

export function recordAnswer(mod: string, q: number, ok: boolean) {
  updateProgress((p) => {
    const k = `${mod}:${q}`;
    const s = p.answers[k] ?? { n: 0, ok: 0, last: 0 };
    return { ...p, answers: { ...p.answers, [k]: { n: s.n + 1, ok: s.ok + (ok ? 1 : 0), last: ok ? 1 : 0 } } };
  });
}

/** Zilele după care revine un card, pe cutie (ca în aplicația veche): cutia 1 azi, 2 mâine, 3 peste 3 zile… */
export const INTERVAL = [0, 0, 1, 3, 7, 14] as const;

export function gradeCard(mod: string, card: number, knew: boolean) {
  updateProgress((p) => {
    const k = `${mod}:${card}`;
    const box = knew ? Math.min(5, (p.cards[k]?.box ?? 1) + 1) : 1;
    return { ...p, cards: { ...p.cards, [k]: { box, due: dayNow() + INTERVAL[box] } } };
  });
}
