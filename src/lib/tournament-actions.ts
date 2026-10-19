"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseAchievements, selfReportedAchievementTypes } from "@/lib/achievements";
import { prisma } from "@/lib/db";
import type { FormState } from "@/lib/form-state";
import { requirePermission, requireUser } from "@/lib/session";
import {
  canRegister,
  formToObject,
  guildRequirement,
  registrationSchema,
  slugify,
  tournamentSchema,
  uniqueSlug,
  validate,
} from "@/lib/tournaments";

// --- Jugadores -----------------------------------------------------------------

/** Crea o actualiza la inscripción del usuario en un torneo. */
export async function saveRegistration(slug: string, _prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser(`/tournaments/${slug}/register`);
  const values = formToObject(formData);

  const [tournament, stored] = await Promise.all([
    prisma.tournament.findUnique({ where: { slug }, select: { id: true, status: true, registrationOpen: true } }),
    prisma.user.findUnique({ where: { id: user.id }, select: { guildMember: true } }),
  ]);
  if (!tournament || !canRegister(tournament)) return { values, message: "not_open" };
  const guild = guildRequirement(process.env.DISCORD_GUILD_ID?.trim(), stored?.guildMember ?? null);
  if (guild !== "ok") return { values, message: guild };

  const result = validate(registrationSchema, values);
  if (!result.ok) return { values, errors: result.errors, message: "form" };

  const data = { ...result.data, rulesAcceptedAt: new Date() };
  await prisma.registration.upsert({
    where: { tournamentId_userId: { tournamentId: tournament.id, userId: user.id } },
    create: { tournamentId: tournament.id, userId: user.id, ...data },
    update: data,
  });
  revalidatePath(`/tournaments/${slug}`);
  redirect(`/tournaments/${slug}?status=registered`);
}

/** Baja del torneo (solo mientras la inscripción está abierta). */
export async function withdrawRegistration(formData: FormData): Promise<void> {
  const slug = String(formData.get("slug") ?? "");
  const user = await requireUser(`/tournaments/${slug}`);
  const tournament = await prisma.tournament.findUnique({
    where: { slug },
    select: { id: true, status: true, registrationOpen: true },
  });
  if (!tournament || !canRegister(tournament) || formData.get("confirm") !== "yes") {
    redirect(`/tournaments/${slug}?status=not_open`);
  }
  await prisma.registration.deleteMany({ where: { tournamentId: tournament.id, userId: user.id } });
  revalidatePath(`/tournaments/${slug}`);
  redirect(`/tournaments/${slug}?status=unregistered`);
}

/** Guarda los logros del perfil (veces que ha ganado cada torneo). */
export async function saveAchievements(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser("/profile");
  const values = formToObject(formData);
  const achievements = parseAchievements(values);
  if (!achievements) return { values, message: "invalid" };

  const keep = achievements.map((a) => a.type);
  await prisma.$transaction([
    prisma.userAchievement.deleteMany({
      // Solo los que indica el jugador: la Liga Puente 3 no se toca desde el perfil.
      where: { userId: user.id, type: { in: selfReportedAchievementTypes.filter((t) => !keep.includes(t)) } },
    }),
    ...achievements.map((a) =>
      prisma.userAchievement.upsert({
        where: { userId_type: { userId: user.id, type: a.type } },
        create: { userId: user.id, type: a.type, count: a.count },
        update: { count: a.count },
      }),
    ),
  ]);
  revalidatePath("/profile");
  return { message: "saved" };
}

// --- Administración ------------------------------------------------------------

/** Crea (id = null) o actualiza un torneo. */
export async function saveTournament(id: string | null, _prev: FormState, formData: FormData): Promise<FormState> {
  await requirePermission("tournaments.manage", "/admin/tournaments");
  const values = formToObject(formData);
  const result = validate(tournamentSchema, values);
  if (!result.ok) return { values, errors: result.errors, message: "form" };

  let targetId = id;
  if (id) {
    await prisma.tournament.update({ where: { id }, data: result.data });
  } else {
    const base = slugify(result.data.name);
    const existing = await prisma.tournament.findMany({
      where: { slug: { startsWith: base } },
      select: { slug: true },
    });
    const created = await prisma.tournament.create({
      data: { ...result.data, slug: uniqueSlug(base, new Set(existing.map((t) => t.slug))) },
      select: { id: true },
    });
    targetId = created.id;
  }
  revalidatePath("/admin/tournaments");
  revalidatePath("/tournaments");
  redirect(`/admin/tournaments/${targetId}?status=saved`);
}

/** Borra un torneo en borrador (y sus inscripciones). */
export async function deleteTournament(formData: FormData): Promise<void> {
  await requirePermission("tournaments.manage", "/admin/tournaments");
  const id = String(formData.get("id") ?? "");
  const tournament = await prisma.tournament.findUnique({ where: { id }, select: { status: true } });
  if (!tournament || tournament.status !== "DRAFT" || formData.get("confirm") !== "yes") {
    redirect(`/admin/tournaments/${id}?status=not_draft`);
  }
  await prisma.tournament.delete({ where: { id } });
  revalidatePath("/admin/tournaments");
  redirect("/admin/tournaments?status=deleted");
}
