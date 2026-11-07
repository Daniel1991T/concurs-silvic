import type { Metadata } from "next";
import { Panou } from "@/components/panou/panou";
import { PageHead } from "@/components/ui/page-head";
import { getExam } from "@/lib/content";

export const metadata: Metadata = { title: "Panou" };

/** Panoul. Datele de progres sunt în browser (și în cont), deci tot calculul se face acolo. */
export default function PanouPage() {
  const modules = getExam()
    .modules.filter((m) => m.status === "ready")
    .map(({ id, abbr, title }) => ({ id, abbr, title }));
  return (
    <>
      <PageHead title="Panou" />
      <Panou modules={modules} />
    </>
  );
}
