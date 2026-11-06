import type { Metadata } from "next";
import { EmptyState, PageHead } from "@/components/ui/page-head";

export const metadata: Metadata = { title: "Simulare" };

export default function SimularePage() {
  return (
    <>
      <PageHead title="Simulare de examen" />
      <EmptyState title="Simularea vine în etapa 5">
        Grile amestecate din toate modulele, cronometrate, cu răspunsurile arătate abia la final.
      </EmptyState>
    </>
  );
}
