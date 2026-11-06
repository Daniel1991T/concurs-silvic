import type { Metadata } from "next";
import { RefProvider } from "@/components/module/ref-chip";
import { Test } from "@/components/module/test";
import { getModule, getModuleRef } from "@/lib/content";
import { buildRefData } from "@/lib/content/ref-data";

export async function generateMetadata({ params }: PageProps<"/modul/[id]/test">): Promise<Metadata> {
  const { id } = await params;
  return { title: `Test · ${getModuleRef(id)?.title ?? "Modul"}` };
}

/** Fila „Test”. */
export default async function TestPage({ params }: PageProps<"/modul/[id]/test">) {
  const { id } = await params;
  const m = getModule(id);
  return (
    <RefProvider
      data={buildRefData(
        m,
        m.questions.map((q) => q.ref),
      )}
    >
      <Test moduleId={id} questions={m.questions} />
    </RefProvider>
  );
}
