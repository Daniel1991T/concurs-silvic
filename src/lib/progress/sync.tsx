"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useSession } from "@/lib/auth-client";
import { EMPTY, normalize, sameProgress, type Progress } from "./model";
import { getProgress, mergeIntoProgress, onEdit, replaceProgress } from "./store";

/*
 * Sincronizarea progresului cu baza de date, cât timp ești logat:
 * - la intrare în cont: aduce progresul de pe server și îl unește cu cel din browser;
 * - după fiecare schimbare: îl trimite (la 1,5 secunde după ultima, ca să nu trimită la fiecare clic);
 * - când revii în fereastră: aduce ce ai făcut între timp pe alt dispozitiv.
 * Fără cont, progresul rămâne doar în browser, ca până acum.
 */

export type SyncState = "local" | "loading" | "saving" | "synced" | "offline" | "error";

let state: SyncState = "local";
let lastSync: number | null = null;
const listeners = new Set<() => void>();
function setState(s: SyncState, synced = false) {
  state = s;
  if (synced) lastSync = Date.now();
  listeners.forEach((l) => l());
}
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};

/** Starea sincronizării, pentru afișare. */
export function useSyncState() {
  const s = useSyncExternalStore(
    subscribe,
    () => state,
    () => "local" as SyncState,
  );
  const at = useSyncExternalStore(
    subscribe,
    () => lastSync,
    () => null,
  );
  return { state: s, lastSync: at };
}

/** Al cui e progresul din browser (ca să nu amestecăm progresul a două conturi pe același dispozitiv). */
const OWNER_KEY = "cs-progress-owner";
function getOwner() {
  try {
    return localStorage.getItem(OWNER_KEY);
  } catch {
    return null;
  }
}
function setOwner(id: string) {
  try {
    localStorage.setItem(OWNER_KEY, id);
  } catch {}
}

async function pull(): Promise<Progress | null> {
  const r = await fetch("/api/progress", { cache: "no-store" });
  if (!r.ok) throw new Error(String(r.status));
  return normalize((await r.json()).data);
}

async function push(p: Progress): Promise<Progress> {
  const r = await fetch("/api/progress", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ data: p }),
  });
  if (!r.ok) throw new Error(String(r.status));
  return normalize((await r.json()).data);
}

let busy: Promise<void> | null = null;

/** Aduce de pe server, unește, și trimite înapoi dacă browserul avea ceva în plus. */
export async function syncNow() {
  if (busy) return busy;
  busy = (async () => {
    try {
      setState("loading");
      const remote = await pull();
      if (!remote) return;
      mergeIntoProgress(remote);
      const local = getProgress();
      if (!sameProgress(local, remote)) {
        setState("saving");
        mergeIntoProgress(await push(local));
      }
      setState("synced", true);
    } catch {
      setState(navigator.onLine ? "error" : "offline");
    } finally {
      busy = null;
    }
  })();
  return busy;
}

/** Pornește sincronizarea cât timp e cineva logat. Se pune o singură dată, în Providers. */
export function ProgressSync() {
  const { data } = useSession();
  const userId = data?.user.id ?? null;

  useEffect(() => {
    if (!userId) {
      setState("local");
      return;
    }
    // progresul din browser e al altui cont: nu-l amestecăm cu al tău
    const owner = getOwner();
    if (owner && owner !== userId) replaceProgress(EMPTY);
    setOwner(userId);
    void syncNow();

    let timer: ReturnType<typeof setTimeout> | undefined;
    const offEdit = onEdit(() => {
      clearTimeout(timer);
      setState("saving");
      timer = setTimeout(() => void syncNow(), 1500);
    });
    const onFocus = () => {
      if (document.visibilityState === "visible") void syncNow();
    };
    document.addEventListener("visibilitychange", onFocus);
    window.addEventListener("online", onFocus);
    return () => {
      clearTimeout(timer);
      offEdit();
      document.removeEventListener("visibilitychange", onFocus);
      window.removeEventListener("online", onFocus);
    };
  }, [userId]);

  return null;
}
