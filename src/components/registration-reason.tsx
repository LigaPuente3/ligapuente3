import { formatDateTimeLong } from "@/lib/format-date";
import { registrationReason, type RegistrationWindow } from "@/lib/tournaments";
import type { Dictionary } from "@/i18n/es";
import { format, type Locale } from "@/i18n/locale";

/** Aviso para administradores: estado real de la inscripción y por qué. */
export function RegistrationReasonNote({
  tournament,
  dict,
  locale,
}: {
  tournament: RegistrationWindow;
  dict: Dictionary;
  locale: Locale;
}) {
  const t = dict.adminTournaments.registrationNow;
  const reason = registrationReason(tournament);
  const date = (d: Date | null | undefined) => (d ? formatDateTimeLong(d, locale) : "");

  const text =
    reason === "open"
      ? format(t.open, {
          until: tournament.registrationClosesAt ? format(t.until, { date: date(tournament.registrationClosesAt) }) : "",
        })
      : reason === "not_yet"
        ? format(t.not_yet, { date: date(tournament.registrationOpensAt) })
        : reason === "ended"
          ? format(t.ended, { date: date(tournament.registrationClosesAt) })
          : t[reason];

  return (
    <p
      role="status"
      className={`rounded-md border p-3 text-sm ${reason === "open" ? "border-wood bg-surface-2 text-wood-light" : "border-border bg-surface-2"}`}
    >
      {text}
    </p>
  );
}
