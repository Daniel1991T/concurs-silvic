import type { ModuleContent, TextDoc } from "./schema";

/*
 * Trimiterile la textul oficial („Reg. art. 7 lit. k)”, „Cod art. 145 alin. (2)”,
 * „L407 anexa 1”, „Ghid pct. 3.3”, „NT Anexa 2”) se transformă în articolele
 * concrete pe care le arată popover-ul. Aceeași logică ca în aplicația veche.
 */

export type RefTarget =
  | { kind: "article"; doc: string; no: string; label: string; highlight: string[] }
  | { kind: "annex"; no: string };

type Article = TextDoc["articles"][number];

export type TextIndex = {
  keys: string[];
  docs: Map<string, { doc: TextDoc; byNo: Map<string, Article> }>;
  annexes: Set<string>;
};

export function buildTextIndex(texts: ModuleContent["texts"]): TextIndex {
  const docs = new Map(texts.docs.map((d) => [d.key, { doc: d, byNo: new Map(d.articles.map((a) => [a.no, a])) }]));
  return {
    keys: texts.docs.map((d) => d.key),
    docs,
    annexes: new Set(texts.annexes?.items.map((a) => a.no) ?? []),
  };
}

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Alineatele și literele de evidențiat: „alin. (2)–(4)” → ["(2)","(3)","(4)"], „lit. b)” → ["b)"]. */
function highlights(seg: string, range: boolean): string[] {
  const hi: string[] = [];
  const al = range
    ? seg.match(/alin\.\s*\((\d+)\)(?:\s*[–-]\s*\((\d+)\))?/)
    : seg.match(/alin\.\s*\((\d+)\)/);
  if (al) for (let k = +al[1]; k <= +(al[2] ?? al[1]); k++) hi.push(`(${k})`);
  const li = seg.match(/lit\.\s*([a-zș])\)/);
  if (li) hi.push(`${li[1]})`);
  return hi;
}

/** O trimitere poate avea mai multe părți, separate prin virgulă; documentul se păstrează de la o parte la alta. */
export function resolveRef(ref: string, idx: TextIndex): RefTarget[] {
  const out: RefTarget[] = [];
  let doc = idx.keys[0];
  const docRe = new RegExp(`^(${idx.keys.map(esc).join("|")})\\b`);

  for (const seg of ref.split(/,\s*/)) {
    const d = seg.match(docRe);
    if (d) doc = d[1];
    const D = idx.docs.get(doc)?.byNo;
    const art = (no: string, highlight: string[]) => {
      const a = D?.get(no);
      if (a) out.push({ kind: "article", doc, no, label: a.label, highlight });
    };
    let m: RegExpMatchArray | null;

    // cheie directă, ex. „NT Anexa 2”, „NT Anexă”
    const rest = seg.replace(new RegExp(`^${esc(doc)}\\s*`), "").trim();
    if (rest && !/^(art|pct|anx)\./.test(rest) && !/^\d/.test(rest) && D?.has(rest)) {
      art(rest, []);
      continue;
    }
    // „anexa 1”, „anexele 1–3”
    if ((m = seg.match(/anex(?:a|ele)\s*(?:nr\.\s*)?(\d+)(?:\s*[–-]\s*(\d+))?/))) {
      for (let k = +m[1]; k <= +(m[2] ?? m[1]); k++) if (idx.annexes.has(String(k))) out.push({ kind: "annex", no: String(k) });
      continue;
    }
    // „pct. 3.3” (ghiduri, normative): urcă la punctul părinte dacă subpunctul nu există
    if ((m = seg.match(/(?:pct|anx)\.\s*(\d+(?:\.\d+)*)/))) {
      let k = m[1];
      while (k && !D?.has(k)) k = k.includes(".") ? k.replace(/\.\d+$/, "") : "";
      if (k) art(k, []);
      continue;
    }
    // „Anexa 1 · termen” → definiția din documentul „Def”
    if ((m = seg.match(/^Anexa 1 · (.+)$/))) {
      const term = m[1].trim();
      const a = idx.docs.get("Def")?.byNo.get(term);
      if (a) out.push({ kind: "article", doc: "Def", no: term, label: a.label, highlight: [] });
      continue;
    }
    // „art. 7^1 alin. (4)”
    if ((m = seg.match(/art\.\s*(\d+)\^(\d+)/))) {
      art(`${m[1]}^${m[2]}`, highlights(seg, false));
      continue;
    }
    // „art. 12”, „art. 2–4”
    if ((m = seg.match(/art\.\s*(\d+)(?:\s*[–-]\s*(\d+))?/))) {
      const a = +m[1];
      const b = +(m[2] ?? m[1]);
      const hi = a === b ? highlights(seg, true) : [];
      for (let k = a; k <= b; k++) art(String(k), hi);
    }
  }
  return out;
}

/** Toate trimiterile dintr-un modul, cu locul unde apar (pentru mesaje de eroare clare). */
export function collectRefs(m: ModuleContent): Array<{ ref: string; where: string }> {
  const r: Array<{ ref: string; where: string }> = [];
  m.lesson.forEach((s, i) => {
    const at = `lecția, secțiunea ${i + 1}`;
    s.paragraphs.forEach((p, j) => p.refs?.forEach((ref) => r.push({ ref, where: `${at}, paragraful ${j + 1}` })));
    s.quiz.forEach((q, j) => r.push({ ref: q.ref, where: `${at}, grila ${j + 1}` }));
    const f = s.figure;
    if (f?.type === "flow") f.steps.forEach((x) => r.push({ ref: x.ref, where: `${at}, figura` }));
    if (f?.type === "grid") f.items.forEach((x) => r.push({ ref: x.ref, where: `${at}, figura` }));
    if (f?.type === "ladder") f.levels.forEach((x) => r.push({ ref: x.ref, where: `${at}, figura` }));
  });
  m.memo.forEach((t, i) => t.rows.forEach((x, j) => r.push({ ref: x.ref, where: `fișa ${i + 1}, rândul ${j + 1}` })));
  m.cards.forEach((c, i) => r.push({ ref: c.ref, where: `cardul ${i + 1}` }));
  m.questions.forEach((q, i) => r.push({ ref: q.ref, where: `testul, grila ${i + 1}` }));
  m.cases.forEach((c, i) => c.steps.forEach((s, j) => r.push({ ref: s.ref, where: `situația ${i + 1}, pasul ${j + 1}` })));
  return r;
}
