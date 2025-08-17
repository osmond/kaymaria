"use client";
import * as React from "react";
import * as ReactDOM from "react-dom";

type DialogCtx = {
  open: boolean;
  onOpenChange?: (v: boolean) => void;
};
const Ctx = React.createContext<DialogCtx | null>(null);

export function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange?: (v: boolean) => void;
  children: React.ReactNode;
}) {
  return <Ctx.Provider value={{ open, onOpenChange }}>{children}</Ctx.Provider>;
}

export function DialogContent({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const ctx = React.useContext(Ctx);
  if (!ctx) return null;
  if (!ctx.open) return null;

  // Close on ESC
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && ctx.onOpenChange?.(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [ctx]);

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 grid place-items-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => ctx.onOpenChange?.(false)}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative z-50 w-[min(560px,92vw)] mx-4 rounded-2xl bg-white shadow-xl ${className}`}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}

export function DialogHeader({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`p-4 pb-2 ${className}`} {...props} />;
}
export function DialogTitle({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={`text-base font-semibold ${className}`} {...props} />;
}
export function DialogDescription({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={`text-sm text-neutral-600 ${className}`} {...props} />;
}
export function DialogFooter({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`p-4 pt-2 flex justify-end gap-2 ${className}`} {...props} />;
}
