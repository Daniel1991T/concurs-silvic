import type { Metadata } from "next";
import { Memo } from "@/components/module/memo";
import { RefProvider } from "@/components/module/ref-chip";
import { getModule, getModuleRef } from "@/lib/content";
import { buildRefData } from "@/lib/content/ref-data";

export async function generateMetadata({ params }: PageProps<"/modul/[id]/fisa">): Promise<Metadata> {
  const { id } = await params;
  return { title: `Fișa de memorat · ${getModuleRef(id)?.title ?? "Modul"}` };
}

/** Fila „Fișa de memorat”. */
export default async function MemoPage({ params }: PageProps<"/modul/[id]/fisa">) {
  const { id } = await params;
  const m = getModule(id);
  return (
    <RefProvider
      data={buildRefData(
        m,
        m.memo.flatMap((t) => t.rows.map((r) => r.ref)),
      )}
    >
      <Memo memo={m.memo} tricks={m.tricks} />
    </RefProvider>
  );
}
