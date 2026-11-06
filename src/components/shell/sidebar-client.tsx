"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bar } from "@/components/ui/bar";
import { Stamp } from "@/components/ui/stamp";
import type { SideEntry } from "@/lib/content";
import type { ModuleRef } from "@/lib/content/schema";
import { cx } from "@/lib/cx";
import { useDrawer } from "./providers";

/** Butonul „☰ Lecții” din antet; există doar pe telefon. */
export function DrawerButton() {
  const { setOpen } = useDrawer();
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="mr-2 inline-flex min-h-11 cursor-pointer items-center gap-1.5 rounded-md border-[1.5px] border-hdr-line bg-white/6 px-3 text-sm font-semibold text-hdr-fg md:hidden"
      aria-haspopup="dialog"
    >
      <svg className="size-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <path d="M3 5h14M3 10h14M3 15h14" />
      </svg>
      Lecții
    </button>
  );
}

function ModuleRow({ m, current }: { m: ModuleRef; current: boolean }) {
  const empty = m.status === "missing";
  const p = 0; // progresul vine din baza de date în etapa 4
  const body = (
    <>
      <Stamp abbr={m.abbr} progress={p} empty={empty} className="[grid-area:st]" />
      <span className={cx("text-sm leading-tight [grid-area:nm]", empty ? "font-normal text-text-3" : "font-semibold")}>
        {m.title}
        <span className="block text-xs font-normal text-text-2">{empty ? "lipsește textul" : m.act}</span>
      </span>
      <span className={cx("font-mono text-xs leading-none font-medium tabular-nums [grid-area:pc]", empty ? "text-text-3" : "text-text-2")}>
        {empty ? "–" : `${p}%`}
      </span>
      <Bar value={p} className={cx("[grid-area:bar]", empty && "opacity-50")} />
    </>
  );
  const cls =
    "grid min-h-15 grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5 rounded-md p-2 text-text no-underline " +
    "[grid-template-areas:'st_nm_pc'_'st_bar_bar']";
  if (empty) return <div className={cls}>{body}</div>;
  return (
    <Link
      href={`/modul/${m.id}`}
      aria-current={current ? "page" : undefined}
      className={cx(cls, "hover:bg-surface-2", current && "bg-brand-soft shadow-[inset_0_0_0_1.5px_var(--brand)] hover:bg-brand-soft")}
    >
      {body}
    </Link>
  );
}

export function SideList({ entries }: { entries: SideEntry[] }) {
  const pathname = usePathname();
  const currentId = pathname?.startsWith("/modul/") ? pathname.split("/")[2] : null;
  return (
    <ul>
      {entries.map((e) =>
        e.kind === "module" ? (
          <li key={e.module.id}>
            <ModuleRow m={e.module} current={e.module.id === currentId} />
          </li>
        ) : (
          <li key={e.group.id}>
            <details className="grp my-2 border-t border-line" open={e.modules.some((m) => m.id === currentId) || undefined}>
              <summary className="flex min-h-13 cursor-pointer items-center gap-3 px-2 font-semibold">
                <Stamp abbr={e.group.abbr} size={36} />
                <span className="min-w-0">
                  {e.group.title}
                  <span className="block text-xs font-normal text-text-2">
                    {e.modules.filter((m) => m.status === "ready").length} din {e.modules.length} părți · {e.group.act}
                  </span>
                </span>
              </summary>
              <ul className="pl-4">
                {e.modules.map((m) => (
                  <li key={m.id}>
                    <ModuleRow m={m} current={m.id === currentId} />
                  </li>
                ))}
              </ul>
            </details>
          </li>
        ),
      )}
    </ul>
  );
}

function SideHead({ ready, total, close }: { ready: number; total: number; close?: boolean }) {
  return (
    <div className="mx-2 mt-2 mb-3 flex items-center justify-between gap-3">
      <h2 className="font-serif text-lg font-semibold">
        Lecții <span className="ml-1 font-sans text-xs font-normal text-text-2">{ready} din {total} gata</span>
      </h2>
      {close && (
        <Dialog.Close className="grid size-11 cursor-pointer place-items-center rounded-md text-2xl text-text hover:bg-surface-2" aria-label="Închide lista de lecții">
          ×
        </Dialog.Close>
      )}
    </div>
  );
}

/**
 * Desktop: coloană fixă în stânga. Telefon: sertar care intră din stânga
 * (Radix Dialog: blochează fundalul, ține focusul înăuntru, se închide cu Esc).
 */
export function SidebarClient({ entries, ready, total }: { entries: SideEntry[]; ready: number; total: number }) {
  const { open, setOpen } = useDrawer();
  return (
    <>
      <aside
        aria-label="Lecții"
        className="sticky top-18 hidden h-[calc(100dvh-4.5rem)] overflow-y-auto border-r border-line bg-surface px-3 pt-4 pb-8 md:block"
      >
        <SideHead ready={ready} total={total} />
        <SideList entries={entries} />
      </aside>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-25 bg-scrim md:hidden" />
          <Dialog.Content
            className="fixed inset-y-0 left-0 z-30 w-[min(340px,88vw)] overflow-y-auto border-r border-ctl bg-surface px-3 pt-4 pb-8 text-text shadow-pop md:hidden"
            aria-describedby={undefined}
          >
            <Dialog.Title className="sr-only">Lecții</Dialog.Title>
            <SideHead ready={ready} total={total} close />
            <SideList entries={entries} />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
