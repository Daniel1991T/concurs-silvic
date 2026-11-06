import { buildTextIndex, resolveRef } from "./refs";
import type { ModuleContent } from "./schema";

/*
 * Ce primește browserul pentru popover-ele unei pagini: doar articolele la care
 * trimite pagina respectivă, nu tot textul legii. Fiecare articol apare o singură
 * dată, chiar dacă mai multe trimiteri duc la el.
 */

export type RefArticle = {
  /** „Art. 7”, „Anexa nr. 1” */
  label: string;
  /** numele documentului, ex. „Regulamentul de pază a fondului forestier” */
  doc: string;
  /** id-ul din pagina „Textul oficial”, pentru linkul „Deschide articolul” */
  anchor: string;
  items: [string, string][];
};

export type RefData = {
  moduleId: string;
  articles: Record<string, RefArticle>;
  /** trimitere → articolele ei (după ancoră) și alineatele de evidențiat */
  refs: Record<string, Array<{ anchor: string; highlight: string[] }>>;
};

/** Ancora unui articol în pagina „Textul oficial”: „t-Cod-7-1” pentru Cod art. 7^1. */
export function articleAnchor(doc: string, no: string) {
  return `t-${doc}-${no}`.replace(/[^A-Za-z0-9ăâîșțşţ-]+/gi, "-");
}
export function annexAnchor(no: string) {
  return `t-anexa-${no}`;
}

export function buildRefData(m: ModuleContent, refs: Iterable<string>): RefData {
  const idx = buildTextIndex(m.texts);
  const out: RefData = { moduleId: m.id, articles: {}, refs: {} };
  for (const ref of refs) {
    if (out.refs[ref]) continue;
    out.refs[ref] = resolveRef(ref, idx).map((t) => {
      if (t.kind === "annex") {
        const anchor = annexAnchor(t.no);
        const annex = m.texts.annexes!.items.find((a) => a.no === t.no)!;
        out.articles[anchor] ??= { label: `Anexa nr. ${t.no}`, doc: m.texts.annexes!.title, anchor, items: annex.items };
        return { anchor, highlight: [] };
      }
      const anchor = articleAnchor(t.doc, t.no);
      const d = idx.docs.get(t.doc)!;
      out.articles[anchor] ??= { label: t.label, doc: d.doc.name, anchor, items: d.byNo.get(t.no)!.items };
      return { anchor, highlight: t.highlight };
    });
  }
  return out;
}
