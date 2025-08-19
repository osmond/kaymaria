"use client";
import * as React from "react";

type DivProps = React.HTMLAttributes<HTMLDivElement>;
type HProps = React.HTMLAttributes<HTMLHeadingElement>;
type PProps = React.HTMLAttributes<HTMLParagraphElement>;

export function Card({ className = "", ...props }: DivProps) {
  return (
    <div
      className={`rounded-2xl border bg-white shadow-card dark:bg-neutral-800 dark:border-neutral-700 ${className}`}
      {...props}
    />
  );
}
export function CardHeader({ className = "", ...props }: DivProps) {
  return <div className={`p-4 md:p-6 ${className}`} {...props} />;
}
export function CardTitle({ className = "", ...props }: HProps) {
  return <h3 className={`text-base font-medium ${className}`} {...props} />;
}
export function CardDescription({ className = "", ...props }: PProps) {
  return <p className={`text-sm text-muted dark:text-neutral-400 ${className}`} {...props} />;
}
export function CardContent({ className = "", ...props }: DivProps) {
  return <div className={`p-4 md:p-6 ${className}`} {...props} />;
}
