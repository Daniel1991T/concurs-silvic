"use client";

import { Bar } from "@/components/ui/bar";
import { Stamp } from "@/components/ui/stamp";
import { useModulePercent } from "./progress-context";

/** Ștampila unui modul, cu inelul umplut după progres. */
export function ModuleStamp({ id, abbr }: { id: string; abbr: string }) {
  return <Stamp abbr={abbr} progress={useModulePercent(id)} />;
}

/** Bara și procentul unui modul, pentru lista de module. */
export function ModulePctBar({ id }: { id: string }) {
  const pct = useModulePercent(id);
  return (
    <span className="mt-2 flex max-w-80 items-center gap-3">
      <Bar value={pct} className="flex-1" />
      <span className="font-mono text-xs text-text-2 tabular-nums">{pct}%</span>
    </span>
  );
}
