"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { cx } from "@/lib/cx";

/*
 * Cronometrul mic din antet. Deocamdată ține momentul pornirii în browser;
 * în etapa 4 sesiunile se salvează în baza de date, pe contul tău.
 */
const KEY = "cs-timer-start";
const EVENT = "cs-timer";

function read(): number | null {
  try {
    const v = localStorage.getItem(KEY);
    return v ? Number(v) : null;
  } catch {
    return null;
  }
}

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(EVENT, cb);
  };
}

function write(v: number | null) {
  try {
    if (v === null) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, String(v));
  } catch {}
  window.dispatchEvent(new Event(EVENT));
}

export function useTimer() {
  const start = useSyncExternalStore(subscribe, read, () => null);
  // „acum” se citește doar în browser (0 la randarea pe server), apoi la fiecare secundă
  const [now, setNow] = useState(0);
  useEffect(() => {
    if (start === null) return;
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const t = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, [start]);
  const elapsed = start === null || now === 0 ? 0 : Math.max(0, now - start);
  return { running: start !== null, elapsed, start: () => write(Date.now()), stop: () => write(null) };
}

export function formatClock(ms: number) {
  const s = Math.floor(ms / 1000);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(Math.floor(s / 3600))}:${p(Math.floor(s / 60) % 60)}:${p(s % 60)}`;
}

export function TimerMini({ className }: { className?: string }) {
  const { running, elapsed, start, stop } = useTimer();
  return (
    <div
      className={cx(
        "inline-flex min-h-11 items-center gap-2 rounded-full border bg-black/16 pl-2 md:pl-3",
        running ? "border-hdr-accent" : "border-hdr-line",
        className,
      )}
      role="timer"
      aria-label="Cronometru"
    >
      <span
        className={cx("hidden size-[9px] flex-none rounded-full md:block", running ? "pulse-dot bg-hdr-accent" : "bg-hdr-fg-2")}
        aria-hidden="true"
      />
      <span className="font-mono text-[0.875rem] leading-none font-medium tabular-nums md:text-sm">{formatClock(elapsed)}</span>
      <button
        type="button"
        onClick={running ? stop : start}
        className="min-h-11 min-w-14 cursor-pointer rounded-full border-0 bg-transparent px-3 text-sm font-bold text-hdr-fg hover:bg-white/10 md:min-w-15"
      >
        {running ? "Stop" : "Start"}
      </button>
    </div>
  );
}
