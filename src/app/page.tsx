import Link from "next/link";
import { ModulePctBar, ModuleStamp } from "@/components/shell/module-pct";
import { PageHead } from "@/components/ui/page-head";
import { Stamp } from "@/components/ui/stamp";
import { getExam, getGroup } from "@/lib/content";

/** Pagina „Module”: toată bibliografia, în ordine. */
export default function ModulesPage() {
  const exam = getExam();
  const ready = exam.modules.filter((m) => m.status === "ready").length;
  return (
    <>
      <PageHead title="Modulele bibliografiei" eyebrow={exam.subtitle} />
      <p className="mb-6 max-w-[62ch] text-text-2">
        Fiecare act din bibliografie e un modul cu lecție, fișă de memorat, flashcards, situații din teren, test și
        textul oficial. {ready} din {exam.modules.length} module au conținut.
      </p>
      <ul className="overflow-hidden rounded-lg border border-line bg-surface shadow-card">
        {exam.modules.map((m) => {
          const empty = m.status === "missing";
          const group = getGroup(m.group);
          const inner = (
            <>
              {empty ? <Stamp abbr={m.abbr} empty /> : <ModuleStamp id={m.id} abbr={m.abbr} />}
              <span className="min-w-0">
                {group && <span className="eyebrow block">{group.title}</span>}
                <span className={empty ? "text-text-3" : "font-semibold"}>{m.title}</span>
                <span className="block text-sm text-text-2">{m.act}</span>
                {!empty && <ModulePctBar id={m.id} />}
              </span>
              {empty && <span className="font-mono text-xs text-text-2">lipsește textul</span>}
            </>
          );
          const cls =
            "grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 border-t border-line px-4 py-3 first:border-t-0";
          return (
            <li key={m.id} className="first:[&>*]:border-t-0">
              {empty ? (
                <div className={cls}>{inner}</div>
              ) : (
                <Link href={`/modul/${m.id}`} className={`${cls} text-text no-underline hover:bg-surface-2`}>
                  {inner}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}
