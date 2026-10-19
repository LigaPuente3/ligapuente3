import type { ReactNode } from "react";

/** Piezas comunes de los formularios (servidor o cliente). */

export const inputClass =
  "min-h-11 w-full rounded-md border border-border bg-surface px-3 text-base placeholder:text-muted aria-[invalid=true]:border-blood";

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1 text-sm text-blood">
      {message}
    </p>
  );
}

export function Fieldset({ legend, children, error }: { legend: string; children: ReactNode; error?: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 font-semibold">{legend}</legend>
      {children}
      {error}
    </fieldset>
  );
}

export function Choice({
  name,
  value,
  label,
  defaultChecked,
  describedBy,
}: {
  name: string;
  value: string;
  label: string;
  defaultChecked?: boolean;
  describedBy?: string;
}) {
  return (
    <label className="flex min-h-11 items-center gap-3">
      <input
        type="radio"
        name={name}
        value={value}
        defaultChecked={defaultChecked}
        // El error se anuncia con aria-describedby: los radios no admiten aria-invalid.
        aria-describedby={describedBy}
        className="size-5 shrink-0 accent-wood"
      />
      <span>{label}</span>
    </label>
  );
}

export function FormMessage({ message, tone = "error" }: { message?: string; tone?: "error" | "ok" }) {
  if (!message) return null;
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-md border p-3 text-sm ${tone === "error" ? "border-blood-dark bg-surface-2" : "border-border bg-surface-2"}`}
    >
      {message}
    </p>
  );
}

export const primaryButtonClass =
  "min-h-11 rounded-md bg-wood px-4 font-semibold text-bg hover:bg-wood-light disabled:opacity-60";
export const secondaryButtonClass =
  "inline-flex min-h-11 items-center rounded-md border border-border px-4 text-muted hover:border-wood hover:text-text";
