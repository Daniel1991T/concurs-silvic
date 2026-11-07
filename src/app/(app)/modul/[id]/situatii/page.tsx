import type { Metadata } from "next";
import { Cases } from "@/components/module/cases";
import { RefProvider } from "@/components/module/ref-chip";
import { getModule, getModuleRef } from "@/lib/content";
import { buildRefData } from "@/lib/content/ref-data";

export async function generateMetadata({ params }: PageProps<"/modul/[id]/situatii">): Promise<Metadata> {
  const { id } = await params;
  return { title: `Situații din teren · ${getModuleRef(id)?.title ?? "Modul"}` };
}

/** Fila „Situații din teren”. */
export default async function CasesPage({ params }: PageProps<"/modul/[id]/situatii">) {
  const { id } = await params;
  const m = getModule(id);
  return (
    <RefProvider
      data={buildRefData(
        m,
        m.cases.flatMap((c) => c.steps.map((s) => s.ref)),
      )}
    >
      <Cases cases={m.cases} />
    </RefProvider>
  );
}
