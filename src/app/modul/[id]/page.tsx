import type { Metadata } from "next";
import { Lesson } from "@/components/module/lesson";
import { RefProvider } from "@/components/module/ref-chip";
import { getModule, getModuleRef } from "@/lib/content";
import { buildRefData } from "@/lib/content/ref-data";

export async function generateMetadata({ params }: PageProps<"/modul/[id]">): Promise<Metadata> {
  const { id } = await params;
  return { title: `Lecția · ${getModuleRef(id)?.title ?? "Modul"}` };
}

/** Fila „Lecția”. */
export default async function LessonPage({ params }: PageProps<"/modul/[id]">) {
  const { id } = await params;
  const m = getModule(id);
  const refs = m.lesson.flatMap((s) => [
    ...s.paragraphs.flatMap((p) => p.refs ?? []),
    ...s.quiz.map((q) => q.ref),
    ...(s.figure?.type === "flow"
      ? s.figure.steps
      : s.figure?.type === "grid"
        ? s.figure.items
        : (s.figure?.levels ?? [])
    ).map((x) => x.ref),
  ]);
  return (
    <RefProvider data={buildRefData(m, refs)}>
      <Lesson moduleId={id} intro={m.intro} sections={m.lesson} />
    </RefProvider>
  );
}
