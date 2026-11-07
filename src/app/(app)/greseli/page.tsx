import type { Metadata } from "next";
import { Mistakes } from "@/components/panou/mistakes";
import { PageHead } from "@/components/ui/page-head";
import { getAllQuestions, getExam } from "@/lib/content";

export const metadata: Metadata = { title: "Greșeli" };

/** Greșelile: care grile sunt greșite se știe doar din progresul tău, deci filtrarea se face în browser. */
export default function GreseliPage() {
  const modules = getExam()
    .modules.filter((m) => m.status === "ready")
    .map(({ id, abbr, title }) => ({ id, abbr, title }));
  return (
    <>
      <PageHead title="Greșelile mele" />
      <Mistakes questions={getAllQuestions()} modules={modules} />
    </>
  );
}
