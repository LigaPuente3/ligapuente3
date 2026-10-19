import type { Locale } from "@/i18n/locale";

/** Fecha sin hora (columnas DATE, guardadas a medianoche UTC) en formato local. */
export function formatDay(date: Date, locale: Locale): string {
  return date.toLocaleDateString(locale === "es" ? "es-ES" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Fecha y hora en horario de España. */
export function formatDateTime(date: Date, locale: Locale): string {
  return date.toLocaleString(locale === "es" ? "es-ES" : "en-GB", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Europe/Madrid",
  });
}

/** Valor para un <input type="date"> (AAAA-MM-DD) o cadena vacía. */
export function toDateInput(date: Date | null | undefined): string {
  return date ? date.toISOString().slice(0, 10) : "";
}
