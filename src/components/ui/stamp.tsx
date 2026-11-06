import type { CSSProperties } from "react";
import { cx } from "@/lib/cx";

type Props = {
  abbr: string;
  /** progres 0–100; la 100 modulul apare „ștampilat”, plin */
  progress?: number;
  /** modul fără text: contur întrerupt, estompat */
  empty?: boolean;
  /** diametru în px (44 implicit; 92 mare, 30 mic) */
  size?: number;
  className?: string;
};

/** Ștampila ciocanului silvic: inelul se umple cu progresul modulului. */
export function Stamp({ abbr, progress = 0, empty, size = 44, className }: Props) {
  const done = !empty && progress >= 100;
  const style = { "--p": progress, "--sz": `${size}px` } as CSSProperties;
  return (
    <span className={cx("stamp", done && "is-done", empty && "is-empty", className)} style={style} aria-hidden="true">
      <b>{abbr}</b>
    </span>
  );
}
