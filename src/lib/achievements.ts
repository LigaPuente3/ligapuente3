/** Logros de los jugadores (lista inicial; ver docs/LIGA.md). */

export const achievementTypes = ["GALACTIC", "REGIONAL", "SECTOR", "PQ", "LIGA_PUENTE3"] as const;
export type AchievementType = (typeof achievementTypes)[number];

/** Los que cada jugador indica en su perfil. */
export const selfReportedAchievementTypes = ["GALACTIC", "REGIONAL", "SECTOR", "PQ"] as const satisfies readonly AchievementType[];

/**
 * Los que no puede marcar el propio jugador: la Liga Puente 3 solo cuenta si la
 * ha ganado aquí (se sumará sola al terminar cada edición) o si la asigna un
 * moderador o administrador (p. ej. ediciones anteriores).
 */
export const managedAchievementTypes = ["LIGA_PUENTE3"] as const satisfies readonly AchievementType[];

/** Icono de cada logro (emoji, sin imágenes externas). */
export const achievementIcons: Record<AchievementType, string> = {
  GALACTIC: "🌌",
  REGIONAL: "🌍",
  SECTOR: "🪐",
  PQ: "🏅",
  LIGA_PUENTE3: "🏆",
};

export const MAX_ACHIEVEMENT_COUNT = 99;

export type Achievement = { type: AchievementType; count: number };

/** Lee un número de veces (vacío = 0). Devuelve null si no es un entero de 0 a 99. */
export function parseCount(raw: string | undefined): number | null {
  const value = (raw ?? "").trim();
  if (value === "") return 0;
  if (!/^\d{1,2}$/.test(value)) return null;
  return Number(value);
}

/**
 * Lee del formulario las veces que se ha ganado cada logro (`achievement_<TIPO>`)
 * de los tipos indicados. Vacío o 0 = no tiene ese logro. Null si algún valor no es válido.
 */
export function parseAchievements(
  form: Record<string, string>,
  types: readonly AchievementType[] = selfReportedAchievementTypes,
): Achievement[] | null {
  const result: Achievement[] = [];
  for (const type of types) {
    const count = parseCount(form[`achievement_${type}`]);
    if (count === null || count > MAX_ACHIEVEMENT_COUNT) return null;
    if (count > 0) result.push({ type, count });
  }
  return result;
}

/** Ordena los logros por importancia (Galactic primero) para mostrarlos. */
export function sortAchievements<T extends { type: AchievementType }>(list: T[]): T[] {
  return [...list].sort((a, b) => achievementTypes.indexOf(a.type) - achievementTypes.indexOf(b.type));
}
