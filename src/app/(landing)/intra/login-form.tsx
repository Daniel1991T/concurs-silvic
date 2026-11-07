"use client";

import { useSearchParams } from "next/navigation";
import { AuthForm } from "@/components/account/account-panel";
import { safeNext } from "@/lib/safe-next";

/** Formularul de intrare; după login mergi la pagina pe care voiai s-o deschizi (sau la module). */
export function LoginForm() {
  const next = safeNext(useSearchParams().get("next"));
  // încărcare completă, ca paznicul (proxy.ts) să vadă noul cookie al sesiunii
  return <AuthForm onDone={() => window.location.assign(next)} />;
}
