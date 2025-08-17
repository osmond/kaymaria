"use client";
import * as React from "react";

type Variant = "default" | "secondary" | "ghost";
type Size = "default" | "sm" | "icon";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className = "", variant = "default", size = "default", ...props },
  ref
) {
  const base =
    "inline-flex items-center justify-center rounded-xl font-medium outline-none transition focus-visible:ring-2 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-600 disabled:opacity-50 disabled:pointer-events-none";
  const byVariant =
    variant === "secondary"
      ? "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
      : variant === "ghost"
      ? "bg-transparent text-neutral-900 hover:bg-neutral-100 dark:text-neutral-100 dark:hover:bg-neutral-800"
      : "bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200";
  const bySize =
    size === "sm" ? "h-8 px-3 text-sm" : size === "icon" ? "h-10 w-10 p-0" : "h-10 px-4";
  return <button ref={ref} className={`${base} ${byVariant} ${bySize} ${className}`} {...props} />;
});
