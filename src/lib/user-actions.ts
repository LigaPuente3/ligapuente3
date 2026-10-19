"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { checkRoleChange, parseAdminIds } from "@/lib/roles";
import { requirePermission, requireUser } from "@/lib/session";

/** Vuelve a la lista de usuarios conservando búsqueda y página. */
function backToUsers(formData: FormData, status: string): never {
  const params = new URLSearchParams();
  const q = formData.get("q");
  const page = formData.get("page");
  if (typeof q === "string" && q) params.set("q", q);
  if (typeof page === "string" && /^\d+$/.test(page)) params.set("page", page);
  params.set("status", status);
  redirect(`/admin/users?${params.toString()}`);
}

/** Cambia el rol guardado de un usuario (solo administradores). */
export async function changeUserRole(formData: FormData): Promise<void> {
  const actor = await requirePermission("users.manage", "/admin/users");
  const userId = formData.get("userId");
  if (typeof userId !== "string") backToUsers(formData, "not_found");

  const target = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, discordId: true } });
  if (!target) backToUsers(formData, "not_found");

  const newRole = formData.get("role");
  const check = checkRoleChange(actor, target, newRole, parseAdminIds(process.env.ADMIN_DISCORD_IDS));
  if (!check.ok) backToUsers(formData, check.reason);

  try {
    await prisma.user.update({ where: { id: target.id }, data: { role: newRole as "PLAYER" | "MODERATOR" | "ADMIN" } });
  } catch (error) {
    console.error("changeUserRole", error);
    backToUsers(formData, "failed");
  }
  revalidatePath("/admin/users");
  backToUsers(formData, "saved");
}

/** Borra la cuenta de quien la pide: usuario, sesiones y cuenta de Discord vinculada. */
export async function deleteMyAccount(formData: FormData): Promise<void> {
  const user = await requireUser("/profile");
  if (formData.get("confirm") !== "yes") redirect("/profile?error=confirm");

  try {
    await prisma.user.delete({ where: { id: user.id } });
  } catch (error) {
    console.error("deleteMyAccount", error);
    redirect("/profile?error=delete");
  }
  // La sesión ya no existe en la base de datos; esto borra también las cookies.
  try {
    await auth.api.signOut({ headers: await headers() });
  } catch (error) {
    console.error("deleteMyAccount signOut", error);
  }
  redirect("/?account=deleted");
}
