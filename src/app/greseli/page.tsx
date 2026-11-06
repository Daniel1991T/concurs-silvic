import type { Metadata } from "next";
import { EmptyState, PageHead } from "@/components/ui/page-head";

export const metadata: Metadata = { title: "Greșeli" };

export default function GreseliPage() {
  return (
    <>
      <PageHead title="Greșelile mele" />
      <EmptyState title="Nicio greșeală încă">
        Aici apar grilele la care ultimul tău răspuns a fost greșit, din toate modulele. Când le răspunzi corect, dispar.
      </EmptyState>
    </>
  );
}
