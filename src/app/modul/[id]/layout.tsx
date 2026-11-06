import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ModuleHead, ModuleTabs } from "@/components/module/module-head";
import { getExam, getGroup, getModuleRef } from "@/lib/content";

// Toate paginile de modul (cu toate filele) se generează la build, din bibliografie.
export function generateStaticParams() {
  return getExam()
    .modules.filter((m) => m.status === "ready")
    .map((m) => ({ id: m.id }));
}

/** Cadrul comun al filelor unui modul: titlul cu progresul, filele și foaia de lucru. */
export default async function ModuleLayout({ params, children }: LayoutProps<"/modul/[id]">) {
  const { id } = await params;
  const ref = getModuleRef(id);
  if (!ref || ref.status !== "ready") notFound();
  const group = getGroup(ref.group);
  return (
    <>
      <ModuleHead id={id} abbr={ref.abbr} title={ref.title} eyebrow={group ? `${group.title} · ${ref.act}` : ref.act} />
      <Suspense fallback={<div className="tabs min-h-12" />}>
        <ModuleTabs id={id} />
      </Suspense>
      <div className="sheet">{children}</div>
    </>
  );
}
