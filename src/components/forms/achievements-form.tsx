"use client";

import { useActionState } from "react";
import { achievementIcons, MAX_ACHIEVEMENT_COUNT, selfReportedAchievementTypes } from "@/lib/achievements";
import { initialFormState, type FormState } from "@/lib/form-state";
import type { Dictionary } from "@/i18n/es";
import { FormMessage, inputClass, primaryButtonClass } from "./fields";

export function AchievementsForm({
  action,
  texts,
  defaults,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  texts: Dictionary["achievements"];
  defaults: Record<string, string>;
}) {
  const [state, formAction, pending] = useActionState(action, initialFormState);
  const values = state.values ?? defaults;

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.message === "saved" ? <FormMessage tone="ok" message={texts.saved} /> : null}
      {state.message === "invalid" ? <FormMessage message={texts.invalid} /> : null}
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {selfReportedAchievementTypes.map((type) => {
          const id = `achievement_${type}`;
          return (
            <li key={type} className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface p-3">
              <label htmlFor={id} className="flex items-center gap-2">
                <span aria-hidden="true" className="text-xl">
                  {achievementIcons[type]}
                </span>
                <span>{texts.names[type]}</span>
              </label>
              <input
                id={id}
                name={id}
                type="number"
                min={0}
                max={MAX_ACHIEVEMENT_COUNT}
                inputMode="numeric"
                defaultValue={values[id] ?? ""}
                placeholder="0"
                title={texts.winsOf.replace("{name}", texts.names[type])}
                className={`${inputClass} w-20 text-center`}
              />
            </li>
          );
        })}
      </ul>
      <div>
        <button type="submit" disabled={pending} className={primaryButtonClass}>
          {texts.save}
        </button>
      </div>
    </form>
  );
}
