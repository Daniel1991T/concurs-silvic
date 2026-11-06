import type { CSSProperties } from "react";
import { cx } from "@/lib/cx";

type Props = {
  /** 0–100 */
  value: number;
  size?: "md" | "lg";
  tone?: "brand" | "accent";
  label?: string;
  className?: string;
};

/** Bară de progres: 6 px la module, 10 px la bibliografie, ruginie pentru ținta zilei. */
export function Bar({ value, size = "md", tone = "brand", label, className }: Props) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <span
      className={cx("bar", size === "lg" && "bar-lg", tone === "accent" && "bar-accent", className)}
      style={{ "--p": v } as CSSProperties}
      role={label ? "progressbar" : undefined}
      aria-label={label}
      aria-valuenow={label ? v : undefined}
      aria-valuemin={label ? 0 : undefined}
      aria-valuemax={label ? 100 : undefined}
    >
      <i />
    </span>
  );
}
