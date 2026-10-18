export const roles = ["PLAYER", "ORGANIZER", "ADMIN"] as const;
export type Role = (typeof roles)[number];

const rank: Record<Role, number> = { PLAYER: 0, ORGANIZER: 1, ADMIN: 2 };

/** Lee ADMIN_DISCORD_IDS ("123, 456") y devuelve los IDs válidos (solo dígitos). */
export function parseAdminIds(raw: string | undefined): Set<string> {
  return new Set(
    (raw ?? "")
      .split(",")
      .map((id) => id.trim())
      .filter((id) => /^\d{5,25}$/.test(id)),
  );
}

function isRole(value: unknown): value is Role {
  return typeof value === "string" && (roles as readonly string[]).includes(value);
}

/**
 * Rol efectivo: ADMIN si su ID de Discord está en ADMIN_DISCORD_IDS; si no, el
 * rol guardado en la base de datos (PLAYER si falta o no es válido).
 */
export function effectiveRole(dbRole: unknown, discordId: string | null | undefined, adminIds: Set<string>): Role {
  if (discordId && adminIds.has(discordId)) return "ADMIN";
  return isRole(dbRole) ? dbRole : "PLAYER";
}

/** ¿Tiene el rol `actual` al menos los permisos de `required`? */
export function hasRole(actual: Role, required: Role): boolean {
  return rank[actual] >= rank[required];
}

/** Correo ficticio que exige Better Auth (no pedimos el correo real a Discord). */
export function placeholderEmail(discordId: string): string {
  return `${discordId}@discord.invalid`;
}

/** ID de Discord a partir del correo ficticio, o null si no tiene ese formato. */
export function discordIdFromPlaceholder(email: unknown): string | null {
  if (typeof email !== "string") return null;
  const match = /^(\d{5,25})@discord\.invalid$/.exec(email);
  return match?.[1] ?? null;
}
