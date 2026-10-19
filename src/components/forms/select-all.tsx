"use client";

/** Casilla «Seleccionar todos»: marca o desmarca las casillas con ese nombre dentro del mismo formulario. */
export function SelectAll({ name, label }: { name: string; label: string }) {
  return (
    <label className="flex min-h-11 items-center gap-3 rounded-md border border-dashed border-border px-3 py-2 text-sm font-semibold">
      <input
        type="checkbox"
        className="size-5 shrink-0 accent-wood"
        onChange={(e) => {
          const form = e.currentTarget.form;
          if (!form) return;
          for (const box of form.querySelectorAll<HTMLInputElement>(`input[type="checkbox"][name="${name}"]`)) {
            box.checked = e.currentTarget.checked;
          }
        }}
      />
      {label}
    </label>
  );
}
