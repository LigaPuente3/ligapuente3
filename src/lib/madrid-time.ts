/**
 * Conversión entre la hora de España (Europe/Madrid, con horario de verano) y UTC,
 * para los campos <input type="datetime-local"> (formato AAAA-MM-DDTHH:mm).
 */

const TIME_ZONE = "Europe/Madrid";

const formatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function madridParts(date: Date): Record<string, number> {
  const parts: Record<string, number> = {};
  for (const p of formatter.formatToParts(date)) if (p.type !== "literal") parts[p.type] = Number(p.value);
  return parts;
}

/** Diferencia (minutos) entre la hora de España y UTC en ese instante: +60 en invierno, +120 en verano. */
function offsetMinutes(date: Date): number {
  const p = madridParts(date);
  const asUtc = Date.UTC(p.year ?? 0, (p.month ?? 1) - 1, p.day ?? 1, p.hour ?? 0, p.minute ?? 0, p.second ?? 0);
  return Math.round((asUtc - date.getTime()) / 60_000);
}

const LOCAL_RE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;

/** «2026-10-20T18:00» (hora de España) → instante UTC. Null si el formato no es válido. */
export function madridLocalToUtc(value: string): Date | null {
  const m = LOCAL_RE.exec(value.trim());
  if (!m) return null;
  const [, y, mo, d, h, mi] = m.map(Number) as [number, number, number, number, number, number];
  if (mo < 1 || mo > 12 || d < 1 || d > 31 || h > 23 || mi > 59) return null;
  const naive = Date.UTC(y, mo - 1, d, h, mi);
  // Dos pasadas para acertar en los días de cambio de hora.
  let utc = naive - offsetMinutes(new Date(naive)) * 60_000;
  utc = naive - offsetMinutes(new Date(utc)) * 60_000;
  return new Date(utc);
}

/** Instante → valor para <input type="datetime-local"> en hora de España. */
export function utcToMadridInput(date: Date | null | undefined): string {
  if (!date) return "";
  const p = madridParts(date);
  const pad = (n: number | undefined) => String(n ?? 0).padStart(2, "0");
  return `${p.year}-${pad(p.month)}-${pad(p.day)}T${pad(p.hour)}:${pad(p.minute)}`;
}
