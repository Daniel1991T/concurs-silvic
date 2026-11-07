"use client";

import { useState, useSyncExternalStore, type FormEvent } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { signIn, signOut, signUp, useSession } from "@/lib/auth-client";
import { fromLegacy } from "@/lib/progress/model";
import { mergeIntoProgress, useProgress } from "@/lib/progress/store";
import { syncNow, useSyncState } from "@/lib/progress/sync";

const field =
  "min-h-11 w-full rounded-md border-[1.5px] border-ctl bg-surface px-3 text-base text-text placeholder:text-text-3";
const label = "mb-1 block text-sm font-semibold";

/** Formularul de intrare în cont sau de cont nou. */
function AuthForm() {
  const [mode, setMode] = useState<"in" | "new">("in");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email") ?? "").trim();
    const password = String(f.get("password") ?? "");
    setBusy(true);
    setError(null);
    const res =
      mode === "in"
        ? await signIn.email({ email, password })
        : await signUp.email({ email, password, name: String(f.get("name") ?? "").trim() || email });
    setBusy(false);
    if (res.error) setError(messageFor(res.error.code, res.error.message));
  }

  return (
    <div className="max-w-md">
      <div className="tabs" role="tablist" aria-label="Intrare sau cont nou">
        <button
          type="button"
          role="tab"
          className="tab cursor-pointer"
          aria-selected={mode === "in"}
          aria-current={mode === "in" ? "page" : undefined}
          onClick={() => setMode("in")}
        >
          Intră în cont
        </button>
        <button
          type="button"
          role="tab"
          className="tab cursor-pointer"
          aria-selected={mode === "new"}
          aria-current={mode === "new" ? "page" : undefined}
          onClick={() => setMode("new")}
        >
          Cont nou
        </button>
      </div>
      <form className="sheet space-y-4" onSubmit={submit}>
        {mode === "new" && (
          <div>
            <label className={label} htmlFor="name">
              Numele
            </label>
            <input className={field} id="name" name="name" autoComplete="name" />
          </div>
        )}
        <div>
          <label className={label} htmlFor="email">
            Email
          </label>
          <input className={field} id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div>
          <label className={label} htmlFor="password">
            Parola {mode === "new" && <span className="font-normal text-text-2">(minimum 8 caractere)</span>}
          </label>
          <input
            className={field}
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete={mode === "in" ? "current-password" : "new-password"}
          />
        </div>
        {error && (
          <p role="alert" className="rounded-md border-2 border-dashed border-err bg-err-bg px-3 py-2 text-sm">
            {error}
          </p>
        )}
        <Button type="submit" variant="primary" size="lg" className="w-full" disabled={busy}>
          {busy ? "Se trimite…" : mode === "in" ? "Intră" : "Creează contul"}
        </Button>
      </form>
    </div>
  );
}

function messageFor(code: string | undefined, fallback: string | undefined) {
  switch (code) {
    case "INVALID_EMAIL_OR_PASSWORD":
      return "Emailul sau parola nu sunt bune.";
    case "USER_ALREADY_EXISTS":
    case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
      return "Există deja un cont cu emailul ăsta. Intră în cont.";
    case "PASSWORD_TOO_SHORT":
      return "Parola trebuie să aibă minimum 8 caractere.";
    case "EMAIL_PASSWORD_SIGN_UP_DISABLED":
      return "Crearea de conturi noi e oprită.";
    default:
      return fallback || "Nu a mers. Încearcă din nou.";
  }
}

const SYNC_TEXT = {
  local: "Progresul e salvat doar în acest browser.",
  loading: "Se aduce progresul din cont…",
  saving: "Se salvează…",
  synced: "Sincronizat cu contul tău.",
  offline: "Fără internet. Progresul se păstrează aici și se trimite când revine conexiunea.",
  error: "Sincronizarea n-a mers. Încerc din nou când revii în aplicație.",
} as const;

/** Importul progresului din aplicația veche (fișierul JSON primit). */
function ImportOld() {
  const [msg, setMsg] = useState<string | null>(null);
  async function onFile(file: File | undefined) {
    if (!file) return;
    try {
      const raw: unknown = JSON.parse(await file.text());
      // fișierul poate fi starea veche direct sau rândul din baza de date a artefactului ({ s: "…" })
      const state = raw && typeof raw === "object" && "s" in raw && typeof raw.s === "string" ? JSON.parse(raw.s) : raw;
      const p = fromLegacy(state);
      const n = Object.keys(p.read).length + Object.keys(p.answers).length + Object.keys(p.cards).length;
      if (!n) {
        setMsg("Fișierul nu conține progres din aplicația veche.");
        return;
      }
      mergeIntoProgress(p, true);
      setMsg(
        `Importat: ${Object.keys(p.read).length} secțiuni citite, ${Object.keys(p.answers).length} grile, ` +
          `${Object.keys(p.cards).length} carduri, ${Object.keys(p.sessions).length} sesiuni.`,
      );
    } catch {
      setMsg("Fișierul nu e un JSON valid.");
    }
  }
  return (
    <section className="mt-8 border-t border-line pt-6">
      <h2 className="font-serif text-lg font-semibold">Progresul din aplicația veche</h2>
      <p className="mt-1 text-sm text-text-2">
        Alege fișierul <code className="font-mono">progres-aplicatia-veche.json</code>. Se adaugă peste progresul de
        aici; nimic nu se pierde.
      </p>
      <label className="mt-3 inline-flex min-h-11 cursor-pointer items-center rounded-md border-[1.5px] border-ctl bg-surface px-4 text-sm font-semibold hover:bg-surface-2 focus-within:outline-3 focus-within:outline-offset-2 focus-within:outline-(--focus)">
        Alege fișierul…
        <input
          type="file"
          accept="application/json,.json"
          className="sr-only"
          onChange={(e) => void onFile(e.target.files?.[0])}
        />
      </label>
      {msg && (
        <p role="status" className="mt-3 text-sm">
          {msg}
        </p>
      )}
    </section>
  );
}

/** Alegerea modului luminos / întunecat (pe telefon e doar aici). */
const noop = () => () => {};
function ThemeChoice() {
  const { theme: chosen, setTheme } = useTheme();
  // tema aleasă se știe doar în browser; pe server nu marcăm niciun buton
  const mounted = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
  const theme = mounted ? chosen : null;
  const opts = [
    ["system", "Ca sistemul"],
    ["light", "Luminos"],
    ["dark", "Întunecat"],
  ] as const;
  return (
    <section className="mt-8 border-t border-line pt-6">
      <h2 className="font-serif text-lg font-semibold">Aspect</h2>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Modul de culoare">
        {opts.map(([v, l]) => (
          <Button
            key={v}
            variant={theme === v ? "primary" : "secondary"}
            aria-pressed={theme === v}
            onClick={() => setTheme(v)}
          >
            {l}
          </Button>
        ))}
      </div>
    </section>
  );
}

/** Pagina „Cont”: intrare / cont nou, starea sincronizării, importul și ieșirea. */
export function AccountPanel() {
  const { data, isPending } = useSession();
  const { state, lastSync } = useSyncState();
  const p = useProgress();

  if (isPending) return <p className="text-text-2">Se verifică sesiunea…</p>;

  const counts = `${Object.keys(p.read).length} secțiuni citite · ${Object.keys(p.answers).length} grile · ${
    Object.keys(p.cards).length
  } carduri · ${Object.keys(p.sessions).length} sesiuni`;

  if (!data) {
    return (
      <>
        <p className="mb-6 max-w-[60ch] text-text-2">
          Cu un cont, progresul se salvează în baza de date și îl găsești pe orice dispozitiv. Fără cont, rămâne doar în
          acest browser ({counts}).
        </p>
        <AuthForm />
        <ImportOld />
        <ThemeChoice />
      </>
    );
  }

  return (
    <div className="max-w-xl">
      <div className="card rounded-lg border border-line bg-surface p-6 shadow-card">
        <p className="eyebrow">Conectat ca</p>
        <p className="mt-1 font-serif text-h3 leading-tight font-semibold">{data.user.name}</p>
        <p className="text-text-2">{data.user.email}</p>
        <p className="mt-4 flex items-center gap-2 text-sm" role="status">
          <span
            className={`inline-block size-2.5 rounded-full ${state === "synced" ? "bg-ok" : state === "error" ? "bg-err" : "bg-accent"}`}
            aria-hidden="true"
          />
          {SYNC_TEXT[state]}
          {state === "synced" && lastSync && (
            <span className="text-text-2">
              ({new Date(lastSync).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })})
            </span>
          )}
        </p>
        <p className="mt-1 text-sm text-text-2">{counts}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => void syncNow()}>
            Sincronizează acum
          </Button>
          <Button variant="ghost" onClick={() => void signOut()}>
            Ieși din cont
          </Button>
        </div>
      </div>
      <ImportOld />
      <ThemeChoice />
    </div>
  );
}
