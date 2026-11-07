import type { Metadata } from "next";
import { Suspense } from "react";
import { LandingHeader } from "@/components/shell/landing-header";
import { getExam } from "@/lib/content";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Intră în cont" };

/** Pagina de intrare: singura pagină, în afară de cea de start, pe care o vezi fără cont. */
export default function LoginPage() {
  const exam = getExam();
  return (
    <div className="flex min-h-dvh flex-col">
      <LandingHeader title={exam.title} />
      <main id="continut" className="flex-1 px-4 py-10 md:px-8 md:py-16">
        <div className="mx-auto w-full max-w-md">
          <p className="eyebrow">Contul tău</p>
          <h1 className="mt-2 mb-3 font-serif text-h1 font-semibold">Intră în cont</h1>
          <p className="mb-8 text-text-2">
            Lecțiile, testele și panoul sunt disponibile după ce intri în cont. Progresul tău se salvează în cont și îl
            găsești pe orice dispozitiv.
          </p>
          {/* formularul citește „?next=” din adresă, deci se randează în browser */}
          <Suspense fallback={<p className="text-text-2">Se încarcă…</p>}>
            <LoginForm />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
