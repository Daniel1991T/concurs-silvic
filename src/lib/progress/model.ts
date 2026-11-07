import { z } from "zod";

/*
 * Forma progresului și regula de unire a două copii (telefon + calculator, browser + server).
 * Fără dependențe de React sau de server: o folosesc și browserul, și ruta /api/progress.
 */

export type Session = { s: number; e: number; m: string; man?: true };
export type SimResult = { n: number; ok: number; dur: number };
export type Prefs = { exam: string; goal: number };

export type Progress = {
  v: 2;
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
  /** sesiunile de studiu cronometrate, după momentul pornirii (ms) */
  sessions: Record<string, Session>;
  /** simulările de examen terminate, după momentul pornirii: câte grile, câte corecte, cât a durat (ms) */
  sims: Record<string, SimResult>;
  /** setările tale: data examenului ("2027-08-30"), ținta zilnică în minute */
  prefs: Partial<Prefs>;
  /**
   * Când s-a schimbat ultima oară fiecare valoare: `${câmp}|${cheie}` → ms.
   * La unire câștigă valoarea mai nouă; o ștergere are tot o dată, ca să nu reapară.
   */
  t: Record<string, number>;
};

export const FIELDS = ["read", "mini", "answers", "cards", "pos", "sessions", "sims", "prefs"] as const;
export type Field = (typeof FIELDS)[number];
/** Tipul unei valori dintr-un câmp (ex. Val<"cards"> = { box, due }). */
export type Val<F extends Field> = Progress[F] extends Record<string, infer V> ? V : never;

export const EMPTY: Progress = {
  v: 2,
  read: {},
  mini: {},
  answers: {},
  cards: {},
  pos: {},
  sessions: {},
  sims: {},
  prefs: {},
  t: {},
};

/** Copie modificată: pune (sau șterge, cu `undefined`) o valoare și îi notează momentul. */
export function setValue<F extends Field>(
  p: Progress,
  field: F,
  key: string,
  value: Val<F> | undefined,
  now = Date.now(),
): Progress {
  const map = { ...p[field] } as Record<string, unknown>;
  if (value === undefined) delete map[key];
  else map[key] = value;
  return { ...p, [field]: map, t: { ...p.t, [`${field}|${key}`]: now } };
}

/**
 * Unește două copii ale progresului, cheie cu cheie: câștigă valoarea schimbată mai recent.
 * La egalitate (de ex. date vechi, fără dată) se păstrează valoarea existentă, preferând-o pe `b`.
 */
export function mergeProgress(a: Progress, b: Progress): Progress {
  const out: Progress = {
    v: 2,
    read: {},
    mini: {},
    answers: {},
    cards: {},
    pos: {},
    sessions: {},
    sims: {},
    prefs: {},
    t: {},
  };
  for (const f of FIELDS) {
    const keys = new Set([...Object.keys(a[f]), ...Object.keys(b[f])]);
    for (const k of Object.keys(a.t).concat(Object.keys(b.t)))
      if (k.startsWith(f + "|")) keys.add(k.slice(f.length + 1));
    const target = out[f] as Record<string, unknown>;
    for (const k of keys) {
      const tk = `${f}|${k}`;
      const ta = a.t[tk] ?? 0;
      const tb = b.t[tk] ?? 0;
      const va = (a[f] as Record<string, unknown>)[k];
      const vb = (b[f] as Record<string, unknown>)[k];
      let v: unknown;
      if (ta > tb) v = va;
      else if (tb > ta) v = vb;
      else v = vb !== undefined ? vb : va;
      if (v !== undefined) target[k] = v;
      const tm = Math.max(ta, tb);
      if (tm) out.t[tk] = tm;
    }
  }
  return out;
}

/** JSON cu cheile sortate, ca două copii cu aceleași date să dea același text. */
function stable(x: unknown): string {
  if (x === null || typeof x !== "object") return JSON.stringify(x);
  if (Array.isArray(x)) return `[${x.map(stable).join(",")}]`;
  const o = x as Record<string, unknown>;
  return `{${Object.keys(o)
    .sort()
    .map((k) => `${JSON.stringify(k)}:${stable(o[k])}`)
    .join(",")}}`;
}

/** Aceleași date? (ca să nu trimitem la server ce are deja) */
export function sameProgress(a: Progress, b: Progress) {
  return stable(a) === stable(b);
}

/* ---------- validare (pentru ce vine de la browser la server) ---------- */

const rec = <T extends z.ZodType>(v: T) => z.record(z.string().max(120), v);
export const ProgressSchema = z.object({
  v: z.literal(2),
  read: rec(z.literal(true)),
  mini: rec(z.object({ pick: z.number().int().min(0).max(9), ok: z.boolean() })),
  answers: rec(
    z.object({ n: z.number().int().min(0), ok: z.number().int().min(0), last: z.union([z.literal(0), z.literal(1)]) }),
  ),
  cards: rec(z.object({ box: z.number().int().min(1).max(5), due: z.number().int() })),
  pos: rec(z.number().int().min(0)),
  sessions: rec(z.object({ s: z.number(), e: z.number(), m: z.string().max(40), man: z.literal(true).optional() })),
  sims: rec(z.object({ n: z.number().int().min(1), ok: z.number().int().min(0), dur: z.number().min(0) })),
  prefs: z.object({
    exam: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    goal: z.number().int().min(5).max(720).optional(),
  }),
  t: rec(z.number()),
});

/** Progres citit dintr-o sursă nesigură (localStorage, server, fișier): completează câmpurile lipsă. */
export function normalize(x: unknown): Progress {
  const o = (x && typeof x === "object" ? x : {}) as Partial<Progress>;
  return {
    v: 2,
    read: o.read ?? {},
    mini: o.mini ?? {},
    answers: o.answers ?? {},
    cards: o.cards ?? {},
    pos: o.pos ?? {},
    sessions: o.sessions ?? {},
    sims: o.sims ?? {},
    prefs: o.prefs ?? {},
    t: o.t ?? {},
  };
}

/* ---------- importul din aplicația veche (artefactul HTML) ---------- */

type Legacy = {
  read?: Record<string, boolean>;
  q?: Record<string, { n?: number; ok?: number; last?: number }>;
  cards?: Record<string, { box?: number; due?: number }>;
  mq?: Record<string, { pick?: number; ok?: boolean }>;
  pos?: Record<string, { sec?: number }>;
  study?: { ses?: Array<{ s: number; e: number; m?: string; man?: number | boolean }>; exam?: string; goal?: number };
};

/**
 * Transformă progresul din aplicația veche în forma nouă. Cheile (modul, secțiune,
 * grilă, card) sunt aceleași, pentru că modulele au fost convertite în aceeași ordine.
 * Datele importate primesc momentul `at`, ca orice schimbare făcută după import să câștige.
 */
export function fromLegacy(raw: unknown, at = 1): Progress {
  const L = (raw && typeof raw === "object" ? raw : {}) as Legacy;
  let p: Progress = { ...EMPTY };
  for (const [k, v] of Object.entries(L.read ?? {})) if (v) p = setValue(p, "read", k, true, at);
  for (const [k, v] of Object.entries(L.q ?? {}))
    p = setValue(p, "answers", k, { n: v.n ?? 0, ok: v.ok ?? 0, last: v.last === 1 ? 1 : 0 }, at);
  for (const [k, v] of Object.entries(L.cards ?? {}))
    if (v.box) p = setValue(p, "cards", k, { box: Math.min(5, Math.max(1, v.box)), due: v.due ?? 0 }, at);
  for (const [k, v] of Object.entries(L.mq ?? {}))
    if (typeof v.pick === "number") p = setValue(p, "mini", k, { pick: v.pick, ok: !!v.ok }, at);
  for (const [k, v] of Object.entries(L.pos ?? {})) if (typeof v.sec === "number") p = setValue(p, "pos", k, v.sec, at);
  for (const s of L.study?.ses ?? [])
    p = setValue(
      p,
      "sessions",
      String(s.s),
      { s: s.s, e: s.e, m: s.m ?? "", ...(s.man ? { man: true as const } : {}) },
      at,
    );
  if (L.study?.exam && /^\d{4}-\d{2}-\d{2}$/.test(L.study.exam)) p = setValue(p, "prefs", "exam", L.study.exam, at);
  if (L.study?.goal) p = setValue(p, "prefs", "goal", L.study.goal, at);
  return p;
}
