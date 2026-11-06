import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Bar } from "@/components/ui/bar";
import { EmptyState } from "@/components/ui/page-head";
import { Stamp } from "@/components/ui/stamp";
import { getExam, getGroup, getModuleRef } from "@/lib/content";

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
  const m = getModuleRef(id);
  if (!m || m.status !== "ready") notFound();
  const group = getGroup(m.group);
  return (
    <>
      <div className="mb-5 flex items-center gap-4 md:mb-8 md:gap-6">
        <Stamp abbr={m.abbr} size={72} className="md:[--sz:92px]!" />
        <div className="min-w-0">
          <p className="eyebrow">{group ? `${group.title} · ${m.act}` : m.act}</p>
          <h1 className="mt-1 font-serif text-[1.75rem] leading-[1.1] font-semibold tracking-[-0.015em] md:text-h1">{m.title}</h1>
          <div className="mt-3 flex items-center gap-3 md:max-w-90">
            <Bar value={0} className="flex-1" label="Progresul modulului" />
            <span className="font-mono text-sm leading-none font-medium">0%</span>
          </div>
        </div>
      </div>
      <EmptyState title="Conținutul modulului vine în etapa 2–3">
        Lecția cu stepper, fișa de memorat, flashcards, situațiile din teren, testul și textul oficial se mută aici din
        aplicația actuală.
      </EmptyState>
    </>
  );
}
