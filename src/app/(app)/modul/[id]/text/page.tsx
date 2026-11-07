import type { Metadata } from "next";
import { LawText } from "@/components/module/law-text";
import { getModule, getModuleRef } from "@/lib/content";

export async function generateMetadata({ params }: PageProps<"/modul/[id]/text">): Promise<Metadata> {
  const { id } = await params;
  return { title: `Textul oficial · ${getModuleRef(id)?.title ?? "Modul"}` };
}

/** Fila „Textul oficial”: tot textul, randat pe server; linkurile „Deschide articolul” duc aici. */
export default async function TextPage({ params }: PageProps<"/modul/[id]/text">) {
  const { id } = await params;
  const m = getModule(id);
  return <LawText texts={m.texts} version={m.version} />;
}
