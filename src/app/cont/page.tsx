import type { Metadata } from "next";
import { AccountPanel } from "@/components/account/account-panel";
import { PageHead } from "@/components/ui/page-head";

export const metadata: Metadata = { title: "Cont" };

/** Pagina „Cont”. Sesiunea se citește în browser, deci pagina rămâne statică și rapidă. */
export default function AccountPage() {
  return (
    <>
      <PageHead title="Contul tău" />
      <AccountPanel />
    </>
  );
}
