import { LinkButton } from "@/components/ui/button";
import { EmptyState, PageHead } from "@/components/ui/page-head";

/** Adresă greșită. Pagina are propriul cadru, pentru că apare și în afara aplicației (sub pagina de prezentare). */
export default function NotFound() {
  return (
    <main id="continut" className="mx-auto max-w-3xl px-4 py-16 md:px-12">
      <PageHead title="Pagina nu există" />
      <EmptyState title="Ai ajuns într-o poiană fără potecă">
        <p className="mb-4">Adresa nu corespunde niciunui modul sau unei pagini din aplicație.</p>
        <div className="flex flex-wrap gap-3">
          <LinkButton href="/module" variant="primary">
            Mergi la module
          </LinkButton>
          <LinkButton href="/" variant="secondary">
            Pagina de start
          </LinkButton>
        </div>
      </EmptyState>
    </main>
  );
}
