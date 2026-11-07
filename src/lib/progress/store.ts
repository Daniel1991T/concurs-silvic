"use client";

import { useSyncExternalStore } from "react";
import { EMPTY, mergeProgress, normalize, setValue, type Field, type Progress } from "./model";

export type { Progress } from "./model";

/*
 * Progresul tău, în browser. Fiecare schimbare se salvează imediat aici (merge și fără
 * internet), iar dacă ești în cont, sync.tsx o trimite și în baza de date.
 */

const KEY = "cs-progress-v2";
const OLD_KEY = "cs-progress-v1"; // forma din etapa 3, fără date pe chei
const listeners = new Set<() => void>();
/** ascultătorii schimbărilor făcute de tine (nu și a celor venite de la server) */
const editListeners = new Set<() => void>();
let cached: Progress | null = null;

function load(): Progress {
  if (cached) return cached;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) cached = normalize(JSON.parse(raw));
    else {
      // prima pornire după etapa 3: preluăm progresul vechi din browser
      const old = localStorage.getItem(OLD_KEY);
      cached = old ? normalize({ ...JSON.parse(old), v: 2 }) : EMPTY;
      if (old) save(cached);
    }
  } catch {
    cached = EMPTY;
  }
  return cached;
}

function save(p: Progress) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {}
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

/** Modifică progresul (o acțiune a ta: răspuns, card, secțiune…). */
export function updateProgress(fn: (p: Progress) => Progress) {
  cached = fn(load());
  save(cached);
  listeners.forEach((l) => l());
  editListeners.forEach((l) => l());
}

/* ---------- pentru sincronizare ---------- */

export function getProgress(): Progress {
  return load();
}

/** Înlocuiește progresul local cu cel unit cu serverul (nu e o schimbare „a ta”, nu declanșează trimiterea). */
export function replaceProgress(p: Progress) {
  cached = p;
  save(p);
  listeners.forEach((l) => l());
}

/** Unește în progresul local o copie venită din altă parte (server, import). */
export function mergeIntoProgress(other: Progress, asEdit = false) {
  const merged = mergeProgress(load(), other);
  if (asEdit) updateProgress(() => merged);
  else replaceProgress(merged);
}

export function onEdit(cb: () => void) {
  editListeners.add(cb);
  return () => {
    editListeners.delete(cb);
  };
}

/* ---------- citire în componente ---------- */

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

const put = <F extends Field>(field: F, key: string, value: Progress[F][string] | undefined) =>
  updateProgress((p) => setValue(p, field, key, value));

export function setRead(mod: string, sec: number, value: boolean) {
  put("read", `${mod}:${sec}`, value ? true : undefined);
}

export function setPos(mod: string, sec: number) {
  put("pos", mod, sec);
}

export function answerMini(mod: string, sec: number, q: number, pick: number, ok: boolean, allOkAfter: boolean) {
  updateProgress((p) => {
    let next = setValue(p, "mini", `${mod}:${sec}:${q}`, { pick, ok });
    // toate mini-grilele secțiunii corecte → secțiunea se bifează singură
    if (allOkAfter) next = setValue(next, "read", `${mod}:${sec}`, true);
    return next;
  });
}

export function resetMini(mod: string, sec: number, q: number) {
  put("mini", `${mod}:${sec}:${q}`, undefined);
}

export function recordAnswer(mod: string, q: number, ok: boolean) {
  updateProgress((p) => {
    const k = `${mod}:${q}`;
    const s = p.answers[k] ?? { n: 0, ok: 0, last: 0 };
    return setValue(p, "answers", k, { n: s.n + 1, ok: s.ok + (ok ? 1 : 0), last: ok ? 1 : 0 });
  });
}

/** Zilele după care revine un card, pe cutie (ca în aplicația veche): cutia 1 azi, 2 mâine, 3 peste 3 zile… */
export const INTERVAL = [0, 0, 1, 3, 7, 14] as const;

export function gradeCard(mod: string, card: number, knew: boolean) {
  updateProgress((p) => {
    const k = `${mod}:${card}`;
    const box = knew ? Math.min(5, (p.cards[k]?.box ?? 1) + 1) : 1;
    return setValue(p, "cards", k, { box, due: dayNow() + INTERVAL[box] });
  });
}

/** O sesiune de studiu cronometrată (de la pornirea până la oprirea cronometrului). */
export function addSession(start: number, end: number, moduleId: string) {
  put("sessions", String(start), { s: start, e: end, m: moduleId });
}
