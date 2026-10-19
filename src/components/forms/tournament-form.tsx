"use client";

import { useActionState } from "react";
import { initialFormState, type FormState } from "@/lib/form-state";
import { tournamentStatuses } from "@/lib/tournaments";
import type { Dictionary } from "@/i18n/es";
import { FieldError, FormMessage, inputClass, primaryButtonClass } from "./fields";

type Texts = Dictionary["adminTournaments"];

export function TournamentForm({
  action,
  texts,
  statusNames,
  defaults,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  texts: Texts;
  statusNames: Dictionary["tournaments"]["status"];
  defaults: Record<string, string>;
}) {
  const [state, formAction, pending] = useActionState(action, initialFormState);
  const values = state.values ?? defaults;
  const errors = state.errors ?? {};
  const errorText = (field: string) => {
    const code = errors[field];
    return code ? (texts.errors[code as keyof typeof texts.errors] ?? texts.errors.invalid) : undefined;
  };
  const field = (name: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label htmlFor={name} className="mb-1 block font-semibold">
        {label}
      </label>
      <input
        id={name}
        name={name}
        defaultValue={values[name] ?? ""}
        aria-invalid={Boolean(errors[name]) || undefined}
        aria-describedby={`err-${name}`}
        className={inputClass}
        {...props}
      />
      <FieldError id={`err-${name}`} message={errorText(name)} />
    </div>
  );

  return (
    <form action={formAction} className="flex flex-col gap-6" noValidate>
      <FormMessage message={state.message ? texts.errors.form : undefined} />
      {field("name", texts.name, { maxLength: 100, required: true })}
      <div>
        <label htmlFor="description" className="mb-1 block font-semibold">
          {texts.description}
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          maxLength={2000}
          defaultValue={values.description ?? ""}
          aria-invalid={Boolean(errors.description) || undefined}
          aria-describedby="err-description"
          className={`${inputClass} py-2`}
        />
        <FieldError id="err-description" message={errorText("description")} />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[8rem_1fr]">
        {field("collectionCode", texts.collectionCode, { maxLength: 10, placeholder: "HMW" })}
        {field("collectionName", texts.collectionName, { maxLength: 60, placeholder: "Homeworlds" })}
      </div>
      {field("rulesUrl", texts.rulesUrl, { type: "url", inputMode: "url", placeholder: "https://", maxLength: 500 })}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {field("startsOn", texts.startsOn, { type: "date" })}
        {field("matchDeadlineOn", texts.matchDeadlineOn, { type: "date" })}
      </div>
      <div>
        <label htmlFor="status" className="mb-1 block font-semibold">
          {texts.status}
        </label>
        <select id="status" name="status" defaultValue={values.status ?? "DRAFT"} aria-describedby="status-help" className={inputClass}>
          {tournamentStatuses.map((status) => (
            <option key={status} value={status}>
              {statusNames[status]}
            </option>
          ))}
        </select>
        <p id="status-help" className="mt-1 text-sm text-muted">
          {texts.statusHelp}
        </p>
      </div>
      <div>
        <label className="flex min-h-11 items-center gap-3">
          <input
            type="checkbox"
            name="registrationOpen"
            defaultChecked={values.registrationOpen === "on"}
            aria-describedby="registration-help"
            className="size-5 shrink-0 accent-wood"
          />
          <span className="font-semibold">{texts.registrationOpen}</span>
        </label>
        <p id="registration-help" className="text-sm text-muted">
          {texts.registrationHelp}
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {field("registrationOpensAt", texts.registrationOpensAt, { type: "datetime-local" })}
        {field("registrationClosesAt", texts.registrationClosesAt, { type: "datetime-local" })}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {field("promotions", texts.promotions, { type: "number", min: 0, max: 10, inputMode: "numeric" })}
        {field("relegations", texts.relegations, { type: "number", min: 0, max: 10, inputMode: "numeric" })}
      </div>
      <div>
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {texts.save}
        </button>
      </div>
    </form>
  );
}
