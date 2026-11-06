"use client";

import { useTheme } from "next-themes";

/** Comută între modul luminos și cel întunecat. Iconița o alege CSS-ul, deci nu „clipește” la încărcare. */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="grid size-11 flex-none cursor-pointer place-items-center rounded-md border-[1.5px] border-hdr-line bg-white/6 text-hdr-fg hover:bg-white/12"
      aria-label="Schimbă modul luminos sau întunecat"
    >
      {/* lună: arătată în modul luminos */}
      <svg
        className="size-5 dark:hidden"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      </svg>
      {/* soare: arătat în modul întunecat */}
      <svg
        className="hidden size-5 dark:block"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    </button>
  );
}
