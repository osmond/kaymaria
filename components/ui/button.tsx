"use client";
import * as React from "react";

type Variant =
  | "primary"
  | "secondary"
  | "ghost"
  | "destructive"
  | "success"
  | "warning";
type Size = "default" | "sm" | "icon";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className = "", variant = "primary", size = "default", ...props },
  ref
) {
  const base =
    "inline-flex items-center justify-center rounded-xl shadow-md font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-50 disabled:pointer-events-none";
  const byVariant =
    variant === "secondary"
      ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
      : variant === "ghost"
      ? "bg-transparent text-foreground hover:bg-background"
      : variant === "destructive"
      ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
      : variant === "success"
      ? "bg-success text-success-foreground hover:bg-success/90"
      : variant === "warning"
      ? "bg-warning text-warning-foreground hover:bg-warning/90"
      : "bg-primary text-primary-foreground hover:bg-primary/90";
  const bySize =
    size === "sm" ? "h-8 px-3 text-sm" : size === "icon" ? "h-10 w-10 p-0" : "h-10 px-4";
  return <button ref={ref} className={`${base} ${byVariant} ${bySize} ${className}`} {...props} />;
});
