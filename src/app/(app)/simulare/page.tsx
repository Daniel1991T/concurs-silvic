import type { Metadata } from "next";
import { Simulation } from "@/components/panou/simulation";
import { PageHead } from "@/components/ui/page-head";
import { getAllQuestions, getExam } from "@/lib/content";

export const metadata: Metadata = { title: "Simulare" };

/** Simularea de examen: grilele tuturor modulelor ajung în browser, care le amestecă. */
export default function SimularePage() {
  const modules = getExam()
    .modules.filter((m) => m.status === "ready")
    .map(({ id, abbr, title }) => ({ id, abbr, title }));
  return (
    <>
      <PageHead title="Simulare de examen" />
      <Simulation questions={getAllQuestions()} modules={modules} />
    </>
  );
}
