import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Bar } from "@/components/ui/bar";
import { EmptyState } from "@/components/ui/page-head";
import { Stamp } from "@/components/ui/stamp";
import { getExam, getGroup, getModule, getModuleRef } from "@/lib/content";

// Toate paginile de modul se generează la build, din bibliografie.
export function generateStaticParams() {
  return getExam()
    .modules.filter((m) => m.status === "ready")
    .map((m) => ({ id: m.id }));
}

export async function generateMetadata({ params }: PageProps<"/modul/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: getModuleRef(id)?.title ?? "Modul" };
}

export default async function ModulePage({ params }: PageProps<"/modul/[id]">) {
  const { id } = await params;
  const ref = getModuleRef(id);
  if (!ref || ref.status !== "ready") notFound();
  const m = getModule(id);
  const group = getGroup(ref.group);
  const counts = [
    [m.lesson.length, "secțiuni"],
    [m.cards.length, "carduri"],
    [m.questions.length, "grile"],
    [m.cases.length, "situații"],
    [m.texts.docs.reduce((n, d) => n + d.articles.length, 0), "articole"],
  ] as const;
  return (
    <>
      <div className="mb-5 flex items-center gap-4 md:mb-8 md:gap-6">
        <Stamp abbr={ref.abbr} size={72} className="md:[--sz:92px]!" />
        <div className="min-w-0">
          <p className="eyebrow">{group ? `${group.title} · ${ref.act}` : ref.act}</p>
          <h1 className="mt-1 font-serif text-[1.75rem] leading-[1.1] font-semibold tracking-[-0.015em] md:text-h1">{ref.title}</h1>
          <div className="mt-3 flex items-center gap-3 md:max-w-90">
            <Bar value={0} className="flex-1" label="Progresul modulului" />
            <span className="font-mono text-sm leading-none font-medium">0%</span>
          </div>
        </div>
      </div>

      <p className="mb-2 max-w-[66ch] text-read leading-[1.72]">{m.intro.replace(/\*\*/g, "")}</p>
      <p className="mb-6 font-mono text-xs text-text-2">{m.version}</p>

      <ul className="mb-6 flex flex-wrap gap-2">
        {counts.map(([n, label]) => (
          <li key={label} className="rounded-sm border border-line bg-surface px-3 py-1.5 text-sm">
            <b className="font-mono font-semibold tabular-nums">{n}</b> {label}
          </li>
        ))}
      </ul>

      <EmptyState title="Filele modulului vin în etapa 3">
        Lecția cu stepper, fișa de memorat, flashcards, situațiile din teren, testul și textul oficial cu popover la
        trimiteri.
      </EmptyState>
    </>
  );
}
