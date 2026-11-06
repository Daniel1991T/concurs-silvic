import type { Metadata } from "next";
import { Flashcards } from "@/components/module/flashcards";
import { RefProvider } from "@/components/module/ref-chip";
import { getModule, getModuleRef } from "@/lib/content";
import { buildRefData } from "@/lib/content/ref-data";

export async function generateMetadata({ params }: PageProps<"/modul/[id]/carduri">): Promise<Metadata> {
  const { id } = await params;
  return { title: `Flashcards · ${getModuleRef(id)?.title ?? "Modul"}` };
}

/** Fila „Flashcards”. */
export default async function CardsPage({ params }: PageProps<"/modul/[id]/carduri">) {
  const { id } = await params;
  const m = getModule(id);
  return (
    <RefProvider
      data={buildRefData(
        m,
        m.cards.map((c) => c.ref),
      )}
    >
      <Flashcards moduleId={id} cards={m.cards} />
    </RefProvider>
  );
}
