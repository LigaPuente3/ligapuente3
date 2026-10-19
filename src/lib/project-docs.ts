import "server-only";
import { forbidden } from "next/navigation";
import { prisma } from "@/lib/db";
import { parseAdminIds, projectDocsAccess } from "@/lib/roles";
import { requireUser, type CurrentUser } from "@/lib/session";

/** Permisos del usuario sobre la documentación del proyecto (lee su acceso de la base de datos). */
export async function getProjectDocsAccess(user: CurrentUser) {
  const stored = await prisma.user
    .findUnique({ where: { id: user.id }, select: { projectDocsAccess: true } })
    .catch(() => null);
  return projectDocsAccess(
    { discordId: user.discordId, role: user.role, projectDocsAccess: stored?.projectDocsAccess ?? false },
    parseAdminIds(process.env.ADMIN_DISCORD_IDS),
  );
}

/** Exige poder ver (o editar) la documentación del proyecto; si no, 403. */
export async function requireProjectDocs(level: "view" | "edit" | "grant", returnTo: string) {
  const user = await requireUser(returnTo);
  const access = await getProjectDocsAccess(user);
  if (!access[level]) forbidden();
  return { user, access };
}

export const SLUG_RE = /^[a-z0-9-]{1,40}$/;
