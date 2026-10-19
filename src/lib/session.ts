import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { forbidden, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { can, effectiveRole, parseAdminIds, type Action, type Role } from "@/lib/roles";

export type CurrentUser = {
  id: string;
  name: string;
  image: string | null;
  discordId: string;
  role: Role;
};

/** Usuario de la sesión actual (o null). Cacheado por petición. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  // headers() fuera del try: Next lo usa para marcar la página como dinámica.
  const requestHeaders = await headers();
  // Sin configuración de inicio de sesión (p. ej. un build sin variables) no hay sesión.
  if (!process.env.BETTER_AUTH_SECRET) return null;
  let session;
  try {
    session = await auth.api.getSession({ headers: requestHeaders });
  } catch (error) {
    // Si la base de datos falla, la web sigue funcionando como si no hubiera sesión.
    console.error("getCurrentUser", error);
    return null;
  }
  if (!session) return null;
  const { user } = session;
  const discordId = typeof user.discordId === "string" ? user.discordId : "";
  return {
    id: user.id,
    name: user.name,
    image: user.image ?? null,
    discordId,
    role: effectiveRole(user.role, discordId, parseAdminIds(process.env.ADMIN_DISCORD_IDS)),
  };
});

/** Exige sesión. Sin sesión → /login (y vuelta a `returnTo`). */
export async function requireUser(returnTo: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  return user;
}

/** Exige sesión y permiso para una acción. Sin sesión → /login; sin permiso → 403. */
export async function requirePermission(action: Action, returnTo: string): Promise<CurrentUser> {
  const user = await requireUser(returnTo);
  if (!can(user.role, action)) forbidden();
  return user;
}
