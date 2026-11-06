import { Fragment } from "react";
import { annexAnchor, articleAnchor } from "@/lib/content/ref-data";
import type { ModuleContent } from "@/lib/content/schema";
import { LawItem } from "./rich";

/** „Art. 1 – Fondul forestier naţional” → numărul în margine, titlul cu italic. */
function splitLabel(label: string) {
  const i = label.indexOf(" – ");
  return i > 0 ? { no: label.slice(0, i), title: label.slice(i + 3) } : { no: label, title: "" };
}

/** Textul oficial: documentele modulului, pe capitole și articole, apoi anexele. */
export function LawText({ texts, version }: { texts: ModuleContent["texts"]; version: string }) {
  const docs = texts.docs.filter((d) => d.inText);
  return (
    <div className="law">
      <p className="mb-6 font-mono text-xs text-text-2">{version}</p>

      {docs.length > 1 && (
        <nav aria-label="Documentele modulului" className="mb-8 flex flex-wrap gap-2">
          {docs.map((d) => (
            <a key={d.key} href={`#doc-${d.key}`} className="ref text-left text-sm whitespace-normal!">
              {d.name}
            </a>
          ))}
          {texts.annexes && (
            <a href="#doc-anexe" className="ref text-left text-sm whitespace-normal!">
              Anexe
            </a>
          )}
        </nav>
      )}

      {docs.map((d) => {
        const chapterAt = new Map(d.chapters.map((c) => [c.from, c.title]));
        return (
          <section key={d.key} id={`doc-${d.key}`} className="mb-12 scroll-mt-40">
            <h2 className="font-serif text-h3 leading-tight font-semibold">{d.title}</h2>
            <p className="mt-2 mb-4 text-sm text-text-2">{d.note}</p>
            {d.articles.map((a) => {
              const { no, title } = splitLabel(a.label);
              const chapter = chapterAt.get(a.no);
              return (
                <Fragment key={a.no}>
                  {chapter && <h3 className="eyebrow mt-8 border-t-2 border-ctl pt-4 text-accent-text">{chapter}</h3>}
                  <section className="art" id={articleAnchor(d.key, a.no)}>
                    <p className="art__n">{no}</p>
                    <div className="min-w-0">
                      {title && <h4 className="art__t">{title}</h4>}
                      <div className="art__b">
                        {a.items.map(([l, t], i) => (
                          <LawItem key={i} label={l} text={t} />
                        ))}
                      </div>
                    </div>
                  </section>
                </Fragment>
              );
            })}
          </section>
        );
      })}

      {texts.annexes && (
        <section id="doc-anexe" className="scroll-mt-40">
          <h2 className="font-serif text-h3 leading-tight font-semibold">{texts.annexes.title}</h2>
          {texts.annexes.items.map((a) => (
            <section key={a.no} className="art" id={annexAnchor(a.no)}>
              <p className="art__n">Anexa {a.no}</p>
              <div className="art__b min-w-0">
                {a.items.map(([l, t], i) => (
                  <LawItem key={i} label={l} text={t} />
                ))}
              </div>
            </section>
          ))}
        </section>
      )}
    </div>
  );
}
