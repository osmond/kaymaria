"use client";
import * as React from "react";

type Variant = "default" | "muted";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  variant?: Variant;
}

export function Label({ className = "", variant = "default", ...props }: LabelProps) {
  const color = variant === "muted" ? "text-muted" : "text-foreground";
  return <label className={`text-sm font-medium ${color} ${className}`} {...props} />;
}
