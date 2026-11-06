import Link from "next/link";
import type { ComponentProps } from "react";
import { cx } from "@/lib/cx";

export type ButtonVariant = "primary" | "accent" | "secondary" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 min-h-11 px-4 rounded-md border-[1.5px] " +
  "font-semibold text-sm leading-[1.1] no-underline cursor-pointer transition-[background,border-color,transform] " +
  "active:translate-y-px disabled:cursor-not-allowed disabled:bg-surface-2 disabled:border-line disabled:text-text-3";

const variants: Record<ButtonVariant, string> = {
  // culoarea conturului stă în fiecare variantă (în bază s-ar bate cu border-ctl)
  primary: "border-transparent bg-brand text-brand-ink hover:bg-brand-hover",
  accent: "border-transparent bg-accent text-accent-ink hover:bg-accent-hover",
  secondary: "border-ctl bg-surface text-text hover:bg-surface-2",
  ghost: "border-transparent text-brand-text hover:bg-brand-soft",
};

const sizes = { md: "", lg: "min-h-13 px-6 text-base" };

export function buttonClass(variant: ButtonVariant = "secondary", size: "md" | "lg" = "md", className?: string) {
  return cx(base, variants[variant], sizes[size], className);
}

type ButtonProps = ComponentProps<"button"> & { variant?: ButtonVariant; size?: "md" | "lg" };

export function Button({ variant, size, className, type = "button", ...rest }: ButtonProps) {
  return <button type={type} className={buttonClass(variant, size, className)} {...rest} />;
}

type LinkButtonProps = ComponentProps<typeof Link> & { variant?: ButtonVariant; size?: "md" | "lg" };

export function LinkButton({ variant, size, className, ...rest }: LinkButtonProps) {
  return <Link className={buttonClass(variant, size, className)} {...rest} />;
}
