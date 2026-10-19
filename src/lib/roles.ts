export const roles = ["PLAYER", "MODERATOR", "ADMIN"] as const;
export type Role = (typeof roles)[number];

const rank: Record<Role, number> = { PLAYER: 0, MODERATOR: 1, ADMIN: 2 };

/**
 * Acciones que se pueden hacer en la web. La tabla `permissions` decide qué rol
 * puede hacer cada una; la documentación de administración (/admin/docs) la
 * explica. Si cambia, actualizar las dos cosas en la misma PR.
 */
export const actions = [
  "tournaments.join", // inscribirse y jugar torneos
  "profile.delete", // borrar su propia cuenta
  "admin.access", // entrar en el panel de administración
  "matches.manage", // emparejamientos, cruces y partidas
  "results.manage", // introducir, confirmar y corregir resultados
  "achievements.manage", // asignar logros que no marca el jugador (Liga Puente 3)
  "tournaments.manage", // crear, editar, abrir y cerrar torneos y divisiones
  "registrations.close", // cerrar la inscripción de un torneo antes de tiempo
  "registrations.manage", // revisar inscripciones, altas manuales y asignar divisiones
  "users.manage", // ver usuarios y cambiar roles (moderador y administrador)
] as const;
export type Action = (typeof actions)[number];

export const permissions: Record<Action, readonly Role[]> = {
  "tournaments.join": ["PLAYER", "MODERATOR", "ADMIN"],
  "profile.delete": ["PLAYER", "MODERATOR", "ADMIN"],
  "admin.access": ["MODERATOR", "ADMIN"],
  "matches.manage": ["MODERATOR", "ADMIN"],
  "results.manage": ["MODERATOR", "ADMIN"],
  "achievements.manage": ["MODERATOR", "ADMIN"],
  "tournaments.manage": ["ADMIN"],
  "registrations.close": ["MODERATOR", "ADMIN"],
  "registrations.manage": ["ADMIN"],
  "users.manage": ["ADMIN"],
};

/** ¿Puede este rol hacer esta acción? */
export function can(role: Role, action: Action): boolean {
  return permissions[action].includes(role);
}

/** Lee ADMIN_DISCORD_IDS ("123, 456") y devuelve los IDs válidos (solo dígitos). */
export function parseAdminIds(raw: string | undefined): Set<string> {
  return new Set(
    (raw ?? "")
      .split(",")
      .map((id) => id.trim())
      .filter((id) => /^\d{5,25}$/.test(id)),
  );
}

export function isRole(value: unknown): value is Role {
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

export type RoleChangeCheck =
  | { ok: true }
  | { ok: false; reason: "not_allowed" | "self" | "config_admin" | "invalid_role" };

/**
 * ¿Puede `actor` cambiar el rol guardado de `target` a `newRole`?
 * - Solo quien puede gestionar usuarios (ADMIN).
 * - Nadie cambia su propio rol (evita quedarse sin administradores por error).
 * - Los administradores por ADMIN_DISCORD_IDS no se cambian desde la web.
 */
export function checkRoleChange(
  actor: { id: string; role: Role },
  target: { id: string; discordId: string | null },
  newRole: unknown,
  adminIds: Set<string>,
): RoleChangeCheck {
  if (!can(actor.role, "users.manage")) return { ok: false, reason: "not_allowed" };
  if (!isRole(newRole)) return { ok: false, reason: "invalid_role" };
  if (actor.id === target.id) return { ok: false, reason: "self" };
  if (target.discordId && adminIds.has(target.discordId)) return { ok: false, reason: "config_admin" };
  return { ok: true };
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

// --- Documentación privada del proyecto ---------------------------------------------

/** Administrador por configuración (su ID de Discord está en ADMIN_DISCORD_IDS). */
export function isConfigAdmin(discordId: string | null | undefined, adminIds: Set<string>): boolean {
  return Boolean(discordId && adminIds.has(discordId));
}

/**
 * La documentación del proyecto la ven los administradores por configuración y
 * los administradores a los que ellos activen el acceso. Solo los primeros la
 * editan y dan acceso. Moderadores y jugadores nunca la ven, aunque tengan la
 * casilla activada (p. ej. si se les bajó el rol).
 */
export function projectDocsAccess(
  user: { discordId: string | null; role: Role; projectDocsAccess: boolean },
  adminIds: Set<string>,
): { view: boolean; edit: boolean; grant: boolean } {
  const owner = isConfigAdmin(user.discordId, adminIds);
  return { view: owner || (user.role === "ADMIN" && user.projectDocsAccess), edit: owner, grant: owner };
}

/** Solo se puede dar acceso a administradores que no lo sean por configuración (esos ya lo tienen). */
export function canReceiveProjectDocsAccess(target: { discordId: string | null; role: Role }, adminIds: Set<string>): boolean {
  return target.role === "ADMIN" && !isConfigAdmin(target.discordId, adminIds);
}
