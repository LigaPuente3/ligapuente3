"use client";

import { useActionState, useState } from "react";
import { inputClass } from "@/components/forms/fields";
import { initialFormState, type FormState } from "@/lib/form-state";
import { gameCounts, playerReportToScore } from "@/lib/league";

type Texts = {
  own: string;
  rival: string;
  save: string;
  invalid: string;
  notAllowed: string;
  /** Con {score} y {rival}. */
  confirm: string;
  confirmYes: string;
  confirmNo: string;
};

/**
 * Desplegables de juegos (0, 1, 2) en dos pasos: elegir y confirmar, porque
 * después el jugador ya no puede cambiarlo (solo moderadores y administradores).
 * Si hay un error, conserva lo elegido y lo indica junto al partido.
 */
export function ReportResultForm({
  action,
  matchId,
  hidden,
  rivalName,
  texts,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  /** Identifica el partido en los ID de los campos; `hidden` son los datos que se envían. */
  matchId: string;
  hidden?: Record<string, string>;
  rivalName: string;
  texts: Texts;
}) {
  const [state, formAction, pending] = useActionState(action, initialFormState);
  const [values, setValues] = useState({ ownGames: "", rivalGames: "" });
  const [confirming, setConfirming] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const serverError =
    state.message === "invalid" ? texts.invalid : state.message === "not_allowed" ? texts.notAllowed : null;
  const error = localError ?? serverError;
  const errorId = `err-${matchId}`;

  const select = (name: "ownGames" | "rivalGames", label: string) => (
    <div>
      <label htmlFor={`${name}-${matchId}`} className="block text-xs text-muted">
        {label}
      </label>
      <select
        id={`${name}-${matchId}`}
        name={name}
        required
        value={values[name]}
        disabled={confirming}
        onChange={(event) => {
          setValues((v) => ({ ...v, [name]: event.target.value }));
          setLocalError(null);
        }}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`${inputClass} w-20 text-center`}
      >
        <option value="" disabled>
          –
        </option>
        {gameCounts.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        // Primer paso: comprobar y pedir confirmación antes de enviar.
        if (!confirming) {
          event.preventDefault();
          if (!playerReportToScore(values.ownGames, values.rivalGames, true)) {
            setLocalError(texts.invalid);
            return;
          }
          setConfirming(true);
        }
      }}
      className="flex flex-col items-end gap-2"
    >
      {Object.entries(hidden ?? { matchId }).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      {/* Los desplegables se desactivan al confirmar: estos campos envían los valores. */}
      {confirming ? (
        <>
          <input type="hidden" name="ownGames" value={values.ownGames} />
          <input type="hidden" name="rivalGames" value={values.rivalGames} />
        </>
      ) : null}
      <div className="flex flex-wrap items-end gap-2">
        {select("ownGames", texts.own)}
        {select("rivalGames", texts.rival)}
        {!confirming ? (
          <button
            type="submit"
            className="min-h-11 rounded-md border border-wood px-3 text-sm font-semibold text-wood-light hover:bg-wood hover:text-bg"
          >
            {texts.save}
          </button>
        ) : null}
      </div>

      {confirming ? (
        <div role="alertdialog" aria-labelledby={`confirm-${matchId}`} className="flex max-w-sm flex-col items-end gap-2 rounded-md border border-wood bg-surface p-3">
          <p id={`confirm-${matchId}`} className="text-right text-sm">
            {texts.confirm
              .replace("{score}", `${values.ownGames}-${values.rivalGames}`)
              .replace("{rival}", rivalName)}
          </p>
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => setConfirming(false)}
              disabled={pending}
              className="min-h-11 rounded-md border border-border px-3 text-sm text-muted hover:border-wood hover:text-text"
            >
              {texts.confirmNo}
            </button>
            <button
              type="submit"
              disabled={pending}
              autoFocus
              className="min-h-11 rounded-md bg-wood px-3 text-sm font-semibold text-bg hover:bg-wood-light disabled:opacity-60"
            >
              {texts.confirmYes}
            </button>
          </div>
        </div>
      ) : null}

      {error ? (
        <p id={errorId} role="alert" className="text-sm text-blood">
          {error}
        </p>
      ) : null}
    </form>
  );
}
