"use client";
import * as React from "react";

type Ctx = {
  value?: string;
  onValueChange?: (v: string) => void;
  open: boolean;
  setOpen: (v: boolean) => void;
  selectedLabel?: string;
  setSelectedLabel: (s?: string) => void;
};
const SelectCtx = React.createContext<Ctx | null>(null);

export function Select({
  value,
  onValueChange,
  children,
}: {
  value?: string;
  onValueChange?: (v: string) => void;
  children: React.ReactNode;
}) {
  const [internal, setInternal] = React.useState<string | undefined>(value);
  const isControlled = value !== undefined;
  React.useEffect(() => {
    if (isControlled) setInternal(value);
  }, [isControlled, value]);

  const [open, setOpen] = React.useState(false);
  const [selectedLabel, setSelectedLabel] = React.useState<string | undefined>(undefined);

  const change = (v: string, label?: string) => {
    if (!isControlled) setInternal(v);
    onValueChange?.(v);
    if (label) setSelectedLabel(label);
    setOpen(false);
  };

  return (
    <div className="relative">
      <SelectCtx.Provider
        value={{
          value: internal,
          onValueChange: (v: string) => change(v),
          open,
          setOpen,
          selectedLabel,
          setSelectedLabel,
        }}
      >
        {children}
      </SelectCtx.Provider>
    </div>
  );
}

export function SelectTrigger({
  className = "",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const ctx = React.useContext(SelectCtx);
  if (!ctx) return null;
  return (
    <button
      type="button"
      className={`h-10 w-full rounded-lg border border-neutral-300 bg-white px-3 text-left ${className}`}
      onClick={() => ctx.setOpen(!ctx.open)}
      {...props}
    >
      {children}
    </button>
  );
}

export function SelectValue({
  placeholder,
  className = "",
}: {
  placeholder?: string;
  className?: string;
}) {
  const ctx = React.useContext(SelectCtx);
  if (!ctx) return null;
  return (
    <span className={`inline-block truncate ${className}`}>
      {ctx.selectedLabel ?? ctx.value ?? placeholder ?? ""}
    </span>
  );
}

export function SelectContent({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const ctx = React.useContext(SelectCtx);
  if (!ctx || !ctx.open) return null;
  return (
    <div className={`absolute z-50 mt-1 w-full rounded-lg border bg-white shadow-md ${className}`}>
      {children}
    </div>
  );
}

export function SelectItem({
  value,
  children,
  className = "",
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = React.useContext(SelectCtx);
  if (!ctx) return null;
  const label =
    typeof children === "string"
      ? children
      : (Array.isArray(children) ? children.find((c) => typeof c === "string") : null) || undefined;

  return (
    <button
      type="button"
      className={`block w-full px-3 py-2 text-left text-sm hover:bg-neutral-100 ${className}`}
      onClick={() => {
        ctx.onValueChange?.(value);
        ctx.setSelectedLabel(label);
        ctx.setOpen(false);
      }}
    >
      {children}
    </button>
  );
}
