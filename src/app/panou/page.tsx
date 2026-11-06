import type { Metadata } from "next";
import { EmptyState, PageHead } from "@/components/ui/page-head";

export const metadata: Metadata = { title: "Panou" };

export default function PanouPage() {
  return (
    <>
      <PageHead title="Panou" />
      <EmptyState title="Panoul vine în etapa 5">
        Aici vor fi cronometrul mare, zilele până la examen, timpul pe zile, calendarul de studiu și situația pe module.
      </EmptyState>
    </>
  );
}
