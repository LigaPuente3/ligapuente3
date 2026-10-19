"use client";

import Link from "next/link";
import { useActionState } from "react";
import { initialFormState, type FormState } from "@/lib/form-state";
import { previousParticipations } from "@/lib/tournaments";
import type { Dictionary } from "@/i18n/es";
import { Choice, FieldError, Fieldset, FormMessage, inputClass, primaryButtonClass, secondaryButtonClass } from "./fields";

type Texts = Dictionary["tournaments"]["form"];

export function RegistrationForm({
  action,
  texts,
  vars,
  defaults,
  rulesUrl,
  cancelHref,
  messages,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  texts: Texts;
  vars: { community: string };
  defaults: Record<string, string>;
  rulesUrl: string | null;
  cancelHref: string;
  messages: Record<string, string>;
}) {
  const [state, formAction, pending] = useActionState(action, initialFormState);
  const values = state.values ?? defaults;
  const errors = state.errors ?? {};
  const errorText = (field: string) => {
    const code = errors[field];
    return code ? (texts.errors[code as keyof typeof texts.errors] ?? texts.errors.invalid) : undefined;
  };
  const fill = (s: string) => s.replace("{community}", vars.community);

  return (
    <form action={formAction} className="flex flex-col gap-8" noValidate>
      <FormMessage message={state.message ? (messages[state.message] ?? texts.errors.form) : undefined} />

      <Fieldset
        legend={texts.previousParticipation}
        error={<FieldError id="err-previous" message={errorText("previousParticipation")} />}
      >
        {previousParticipations.map((option) => (
          <Choice
            key={option}
            name="previousParticipation"
            value={option}
            label={texts.participation[option]}
            defaultChecked={values.previousParticipation === option}
            describedBy="err-previous"
          />
        ))}
      </Fieldset>

      <Fieldset legend={texts.firstTimeBigWin} error={<FieldError id="err-bigwin" message={errorText("firstTimeBigWin")} />}>
        <Choice name="firstTimeBigWin" value="yes" label={texts.yes} defaultChecked={values.firstTimeBigWin === "yes"} describedBy="err-bigwin" />
        <Choice name="firstTimeBigWin" value="no" label={texts.no} defaultChecked={values.firstTimeBigWin === "no"} describedBy="err-bigwin" />
      </Fieldset>

      <Fieldset legend={fill(texts.streamingConsent)} error={<FieldError id="err-stream" message={errorText("streamingConsent")} />}>
        <Choice name="streamingConsent" value="yes" label={texts.yes} defaultChecked={values.streamingConsent === "yes"} describedBy="err-stream" />
        <Choice name="streamingConsent" value="no" label={texts.no} defaultChecked={values.streamingConsent === "no"} describedBy="err-stream" />
      </Fieldset>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="city" className="mb-1 block font-semibold">
            {texts.city}
          </label>
          <input id="city" name="city" defaultValue={values.city ?? ""} maxLength={80} autoComplete="address-level2" aria-invalid={Boolean(errors.city) || undefined} aria-describedby="err-city location-note" className={inputClass} />
          <FieldError id="err-city" message={errorText("city")} />
        </div>
        <div>
          <label htmlFor="country" className="mb-1 block font-semibold">
            {texts.country}
          </label>
          <input id="country" name="country" defaultValue={values.country ?? ""} maxLength={80} autoComplete="country-name" aria-invalid={Boolean(errors.country) || undefined} aria-describedby="err-country location-note" className={inputClass} />
          <FieldError id="err-country" message={errorText("country")} />
        </div>
        <p id="location-note" className="text-sm text-muted sm:col-span-2">
          {texts.locationNote}
        </p>
      </div>

      <div>
        <label className="flex items-start gap-3">
          <input type="checkbox" name="rulesAccepted" value="yes" defaultChecked={values.rulesAccepted === "yes"} aria-invalid={Boolean(errors.rulesAccepted) || undefined} aria-describedby="err-rules" className="mt-0.5 size-5 shrink-0 accent-wood" />
          <span>{texts.rulesAccepted}</span>
        </label>
        {rulesUrl ? (
          <a href={rulesUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-11 items-center text-wood-light underline hover:text-text">
            {texts.rulesLink} ↗
          </a>
        ) : null}
        <FieldError id="err-rules" message={errorText("rulesAccepted")} />
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {texts.submit}
        </button>
        <Link href={cancelHref} className={secondaryButtonClass}>
          {texts.cancel}
        </Link>
      </div>
    </form>
  );
}
