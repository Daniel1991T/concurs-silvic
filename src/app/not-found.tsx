import { LinkButton } from "@/components/ui/button";
import { EmptyState, PageHead } from "@/components/ui/page-head";

export default function NotFound() {
  return (
    <>
      <PageHead title="Pagina nu există" />
      <EmptyState title="Ai ajuns într-o poiană fără potecă">
        <p className="mb-4">Adresa nu corespunde niciunui modul sau unei pagini din aplicație.</p>
        <LinkButton href="/" variant="primary">
          Înapoi la module
        </LinkButton>
      </EmptyState>
    </>
  );
}
