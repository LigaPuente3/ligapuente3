"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireProjectDocs, SLUG_RE } from "@/lib/project-docs";
import { canReceiveProjectDocsAccess, parseAdminIds } from "@/lib/roles";

const MAX_BODY = 100_000;

/** Crea o actualiza un documento (solo administradores por configuración). */
export async function saveProjectDoc(formData: FormData): Promise<void> {
  const { user } = await requireProjectDocs("edit", "/admin/project");
  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "");
  if (!SLUG_RE.test(slug) || title.length < 1 || title.length > 100 || body.length > MAX_BODY) {
    redirect(`/admin/project?edit=${encodeURIComponent(slug || "new")}&status=invalid`);
  }
  await prisma.projectDoc.upsert({
    where: { slug },
    create: { slug, title, body, updatedById: user.id },
    update: { title, body, updatedById: user.id },
  });
  revalidatePath("/admin/project");
  redirect(`/admin/project?doc=${slug}&status=saved`);
}

/** Borra un documento (solo administradores por configuración, con confirmación). */
export async function deleteProjectDoc(formData: FormData): Promise<void> {
  await requireProjectDocs("edit", "/admin/project");
  const slug = String(formData.get("slug") ?? "");
  if (formData.get("confirm") !== "yes") redirect(`/admin/project?edit=${encodeURIComponent(slug)}`);
  await prisma.projectDoc.deleteMany({ where: { slug } });
  revalidatePath("/admin/project");
  redirect("/admin/project?status=deleted");
}

/** Activa o quita el acceso de una persona a la documentación (solo administradores por configuración). */
export async function setProjectDocsAccess(formData: FormData): Promise<void> {
  await requireProjectDocs("grant", "/admin/users");
  const userId = String(formData.get("userId") ?? "");
  const value = formData.get("access") === "yes";
  const params = new URLSearchParams();
  for (const key of ["q", "page"]) {
    const v = formData.get(key);
    if (typeof v === "string" && v) params.set(key, v);
  }
  const target = await prisma.user.findUnique({ where: { id: userId }, select: { discordId: true, role: true } });
  // Solo a administradores (no por configuración, que ya lo tienen siempre). Quitarlo se permite siempre.
  if (!target || (value && !canReceiveProjectDocsAccess(target, parseAdminIds(process.env.ADMIN_DISCORD_IDS)))) {
    params.set("status", "invalid_role");
  } else {
    await prisma.user.update({ where: { id: userId }, data: { projectDocsAccess: value } });
    params.set("status", "saved");
  }
  revalidatePath("/admin/users");
  redirect(`/admin/users?${params.toString()}`);
}
