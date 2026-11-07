import Link from "next/link";
import { RefChip } from "@/components/module/ref-chip";
import { LandingHeader } from "@/components/shell/landing-header";
import { ModuleStamp } from "@/components/shell/module-pct";
import { buttonClass } from "@/components/ui/button";
import { getExam, getModule, getModuleRef } from "@/lib/content";
import { Rich } from "@/components/module/rich";
import { LandingModuleRow } from "./module-row";

/*
 * Pagina de prezentare („/”), după macheta „Landing page”: un singur ecran verde, cu
 * titlul, cele două butoane, un card cu exemple din aplicație și patru cifre jos.
 */

export default function LandingPage() {
  const exam = getExam();
  // un exemplu real din conținut pentru caseta „De reținut” din card
  const paza = getModule("paza");
  const keep = paza.lesson[0].keep[1];
  const keepRef = paza.lesson[0].paragraphs.flatMap((p) => p.refs ?? [])[1];
  const examples = ["paza", "cs4"].map((id) => getModuleRef(id)!);

  return (
    <div className="flex min-h-dvh flex-col md:h-dvh md:min-h-[560px] md:overflow-hidden">
      <LandingHeader title={exam.title} />

      <main
        id="continut"
        className="on-dark contours flex min-h-0 flex-1 flex-col justify-between bg-hdr-bg text-hdr-fg"
      >
        <div className="mx-auto grid w-full max-w-[1200px] flex-1 items-center gap-14 px-4 py-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:px-8 md:py-0">
          <div>
            <p className="eyebrow text-hdr-fg-2!">Concursul Romsilva · {exam.subtitle.replace(" · Romsilva", "")}</p>
            <h1 className="mt-4 font-serif text-[2.5rem] leading-[1.05] font-semibold tracking-[-0.02em] text-balance md:text-[3.5rem]">
              Pregătește concursul de inginer silvic, un modul pe zi.
            </h1>
            <p className="mt-5 max-w-[46ch] text-read leading-[1.6] text-hdr-fg-2">
              Lecții, fișe de memorat, flashcards, situații din teren și grile, pe {exam.modules.length} de module. Pe
              calculator și pe telefon, în română, cu textul oficial la un clic distanță.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/module" className={buttonClass("accent", "lg", "max-md:flex-1")}>
                Începe pregătirea
              </Link>
              <Link
                href="/modul/paza"
                className={buttonClass("ghost", "lg", "border-hdr-line! text-hdr-fg! hover:bg-white/8! max-md:flex-1")}
              >
                Vezi cum funcționează
              </Link>
            </div>
          </div>

          {/* exemplu din aplicație: decor, nu se citește cu cititorul de ecran */}
          <div className="hidden md:block" aria-hidden="true" inert>
            <div className="-rotate-[1.2deg] rounded-lg border border-line bg-surface p-5 text-text shadow-pop">
              {examples.map((m) => (
                <LandingModuleRow key={m.id} id={m.id} abbr={m.abbr} title={m.title} act={m.act}>
                  <ModuleStamp id={m.id} abbr={m.abbr} />
                </LandingModuleRow>
              ))}
              <div className="note mt-9! mb-2! text-[1.0625rem]!">
                <span className="note__tag">De reținut</span>
                <Rich text={keep} /> {keepRef && <RefChip refText={keepRef} />}
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto w-full max-w-[1200px] px-4 md:px-8">
          <ul className="grid grid-cols-2 border-t border-hdr-line md:grid-cols-4">
            {[
              [String(exam.modules.length), "Module"],
              ["6", "File pe modul"],
              ["1–5", "Cutii Leitner"],
              ["Simulare", "Examen cronometrat"],
            ].map(([n, l], i) => (
              <li
                key={l}
                className={
                  "py-5 pr-6 md:pb-6 " +
                  (i % 2 === 1 ? "border-l border-hdr-line pl-6 " : "") +
                  (i >= 2 ? "max-md:border-t max-md:border-hdr-line " : "") +
                  (i === 2 ? "md:border-l md:border-hdr-line md:pl-6" : "")
                }
              >
                <b className="block font-serif text-[2.25rem] leading-none font-semibold tracking-[-0.02em] tabular-nums">
                  {n}
                </b>
                <span className="mt-2 block font-mono text-xs leading-tight tracking-[0.12em] text-hdr-fg-2 uppercase">
                  {l}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
