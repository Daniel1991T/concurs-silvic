"use client";

import type { ReactNode } from "react";
import { useModulePercent } from "@/components/shell/progress-context";
import { Bar } from "@/components/ui/bar";

/** Un rând de modul ca în bara laterală, pentru cardul de pe pagina de prezentare (cu progresul tău real). */
export function LandingModuleRow({
  id,
  title,
  act,
  children,
}: {
  id: string;
  abbr: string;
  title: string;
  act: string;
  children: ReactNode;
}) {
  const p = useModulePercent(id);
  return (
    <div className="grid min-h-15 grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1.5 rounded-md p-2 [grid-template-areas:'st_nm_pc'_'st_bar_bar']">
      <span className="[grid-area:st]">{children}</span>
      <span className="text-sm leading-tight font-semibold [grid-area:nm]">
        {title}
        <span className="block text-xs font-normal text-text-2">{act}</span>
      </span>
      <span className="font-mono text-xs leading-none font-medium text-text-2 tabular-nums [grid-area:pc]">{p}%</span>
      <Bar value={p} className="[grid-area:bar]" />
    </div>
  );
}
