"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import type { FormState } from "@/lib/form-state";
import {
  canReportResult,
  divisionTiers,
  drawGroups,
  pairsForNewMember,
  parseResult,
  roundRobinPairs,
  playerReportToScore,
  type DivisionTier,
} from "@/lib/league";
import { requirePermission, requireUser } from "@/lib/session";

function isTier(value: unknown): value is DivisionTier {
  return typeof value === "string" && (divisionTiers as readonly string[]).includes(value);
}

/** Vuelve a la página de divisiones y grupos del torneo con un aviso. */
function backToGroups(tournamentId: string, status: string): never {
  revalidatePath(`/admin/tournaments/${tournamentId}/groups`);
  redirect(`/admin/tournaments/${tournamentId}/groups?status=${status}`);
}

async function revalidateTournament(tournamentId: string) {
  const t = await prisma.tournament.findUnique({ where: { id: tournamentId }, select: { slug: true } });
  if (t) revalidatePath(`/tournaments/${t.slug}`);
}

// --- Administración: divisiones y grupos -----------------------------------------

/** Asigna (o quita) la división de una inscripción. No se cambia si ya está en un grupo. */
export async function setDivision(formData: FormData): Promise<void> {
  const tournamentId = String(formData.get("tournamentId") ?? "");
  await requirePermission("registrations.manage", `/admin/tournaments/${tournamentId}/groups`);
  const registrationId = String(formData.get("registrationId") ?? "");
  const raw = formData.get("division");
  const division = raw === "" ? null : isTier(raw) ? raw : undefined;
  if (division === undefined) backToGroups(tournamentId, "invalid");

  const registration = await prisma.registration.findUnique({
    where: { id: registrationId },
    select: { tournamentId: true, groupMember: { select: { id: true } } },
  });
  if (!registration || registration.tournamentId !== tournamentId) backToGroups(tournamentId, "invalid");
  if (registration.groupMember) backToGroups(tournamentId, "in_group");

  await prisma.registration.update({ where: { id: registrationId }, data: { division } });
  backToGroups(tournamentId, "saved");
}

/** Sortea los grupos de una división y genera sus partidos de todos contra todos. */
export async function drawDivision(formData: FormData): Promise<void> {
  const tournamentId = String(formData.get("tournamentId") ?? "");
  await requirePermission("registrations.manage", `/admin/tournaments/${tournamentId}/groups`);
  const division = formData.get("division");
  const groupCount = Number(formData.get("groupCount"));
  if (!isTier(division) || !Number.isInteger(groupCount) || groupCount < 1) backToGroups(tournamentId, "invalid");

  const [existing, players] = await Promise.all([
    prisma.group.count({ where: { tournamentId, division } }),
    prisma.registration.findMany({
      where: { tournamentId, division, groupMember: null },
      select: { id: true },
    }),
  ]);
  if (existing > 0) backToGroups(tournamentId, "already_drawn");
  if (players.length < 2 || groupCount > Math.floor(players.length / 2)) backToGroups(tournamentId, "too_few_players");

  const groups = drawGroups(
    players.map((p) => p.id),
    groupCount,
  );
  await prisma.$transaction(async (tx) => {
    for (const [index, members] of groups.entries()) {
      const group = await tx.group.create({
        data: { tournamentId, division, number: index + 1 },
        select: { id: true },
      });
      await tx.groupMember.createMany({ data: members.map((registrationId) => ({ groupId: group.id, registrationId })) });
      await tx.match.createMany({
        data: roundRobinPairs(members).map(([playerAId, playerBId]) => ({ groupId: group.id, playerAId, playerBId })),
      });
    }
  });
  await revalidateTournament(tournamentId);
  backToGroups(tournamentId, "drawn");
}

/** Deshace el sorteo de una división (solo si aún no hay resultados). */
export async function resetDivision(formData: FormData): Promise<void> {
  const tournamentId = String(formData.get("tournamentId") ?? "");
  await requirePermission("registrations.manage", `/admin/tournaments/${tournamentId}/groups`);
  const division = formData.get("division");
  if (!isTier(division) || formData.get("confirm") !== "yes") backToGroups(tournamentId, "invalid");

  const played = await prisma.match.count({ where: { group: { tournamentId, division }, status: { not: "PENDING" } } });
  if (played > 0) backToGroups(tournamentId, "has_results");
  await prisma.group.deleteMany({ where: { tournamentId, division } });
  await revalidateTournament(tournamentId);
  backToGroups(tournamentId, "reset");
}

/** Añade a un grupo ya sorteado a un jugador de esa división (p. ej. inscripción tardía en la Común). */
export async function addToGroup(formData: FormData): Promise<void> {
  const tournamentId = String(formData.get("tournamentId") ?? "");
  await requirePermission("registrations.manage", `/admin/tournaments/${tournamentId}/groups`);
  const registrationId = String(formData.get("registrationId") ?? "");
  const groupId = String(formData.get("groupId") ?? "");

  const [registration, group] = await Promise.all([
    prisma.registration.findUnique({
      where: { id: registrationId },
      select: { tournamentId: true, division: true, groupMember: { select: { id: true } } },
    }),
    prisma.group.findUnique({
      where: { id: groupId },
      select: { tournamentId: true, division: true, members: { select: { registrationId: true } } },
    }),
  ]);
  if (
    !registration ||
    !group ||
    registration.tournamentId !== tournamentId ||
    group.tournamentId !== tournamentId ||
    registration.division !== group.division ||
    registration.groupMember
  ) {
    backToGroups(tournamentId, "invalid");
  }

  await prisma.$transaction([
    prisma.groupMember.create({ data: { groupId, registrationId } }),
    prisma.match.createMany({
      data: pairsForNewMember(
        registrationId,
        group.members.map((m) => m.registrationId),
      ).map(([playerAId, playerBId]) => ({ groupId, playerAId, playerBId })),
    }),
  ]);
  await revalidateTournament(tournamentId);
  backToGroups(tournamentId, "added");
}

/** Saca a un jugador de su grupo (solo si no tiene partidos con resultado). Borra sus partidos pendientes. */
export async function removeFromGroup(formData: FormData): Promise<void> {
  const tournamentId = String(formData.get("tournamentId") ?? "");
  await requirePermission("registrations.manage", `/admin/tournaments/${tournamentId}/groups`);
  const memberId = String(formData.get("memberId") ?? "");
  const member = await prisma.groupMember.findUnique({
    where: { id: memberId },
    select: { groupId: true, registrationId: true, group: { select: { tournamentId: true } } },
  });
  if (!member || member.group.tournamentId !== tournamentId) backToGroups(tournamentId, "invalid");

  const involving = {
    groupId: member.groupId,
    OR: [{ playerAId: member.registrationId }, { playerBId: member.registrationId }],
  };
  const withResult = await prisma.match.count({ where: { ...involving, status: { not: "PENDING" } } });
  if (withResult > 0) backToGroups(tournamentId, "has_results");

  await prisma.$transaction([
    prisma.match.deleteMany({ where: involving }),
    prisma.groupMember.delete({ where: { id: memberId } }),
  ]);
  await revalidateTournament(tournamentId);
  backToGroups(tournamentId, "removed");
}

// --- Resultados ----------------------------------------------------------------------

async function loadMatch(matchId: string) {
  return prisma.match.findUnique({
    where: { id: matchId },
    select: {
      id: true,
      status: true,
      playerAId: true,
      playerBId: true,
      playerA: { select: { userId: true } },
      playerB: { select: { userId: true } },
      group: { select: { tournament: { select: { slug: true, status: true } } } },
    },
  });
}

function backToTournament(slug: string, status: string): never {
  revalidatePath(`/tournaments/${slug}`);
  redirect(`/tournaments/${slug}?status=${status}#liguilla`);
}

/**
 * Cualquiera de los dos jugadores anota el resultado de su partido (sus juegos y los del rival).
 * Devuelve el error sin recargar la página, para que el formulario conserve lo elegido.
 */
export async function reportResult(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = { ownGames: String(formData.get("ownGames") ?? ""), rivalGames: String(formData.get("rivalGames") ?? "") };
  const match = await loadMatch(String(formData.get("matchId") ?? ""));
  if (!match) return { values, message: "not_allowed" };
  const slug = match.group.tournament.slug;
  const user = await requireUser(`/tournaments/${slug}`);

  const myRegistration =
    match.playerA?.userId === user.id ? match.playerAId : match.playerB?.userId === user.id ? match.playerBId : null;
  const side = canReportResult(match, myRegistration, match.group.tournament.status);
  if (!side) return { values, message: "not_allowed" };
  const score = playerReportToScore(values.ownGames, values.rivalGames, side === "A");
  if (!score) return { values, message: "invalid" };

  // Solo si sigue pendiente: evita pisar un resultado que otro haya puesto a la vez.
  const updated = await prisma.match.updateMany({
    where: { id: match.id, status: "PENDING" },
    data: { status: "PLAYED", ...score, reportedById: user.id, reportedAt: new Date() },
  });
  revalidatePath(`/tournaments/${slug}`);
  return updated.count > 0 ? { message: "saved" } : { values, message: "not_allowed" };
}

/** Moderadores: poner, corregir o anular el resultado de cualquier partido. */
export async function setMatchResult(formData: FormData): Promise<void> {
  const matchId = String(formData.get("matchId") ?? "");
  const match = await loadMatch(matchId);
  if (!match) redirect("/tournaments");
  const slug = match.group.tournament.slug;
  const user = await requirePermission("results.manage", `/tournaments/${slug}`);

  const value = formData.get("result");
  const reset = { gamesA: null, gamesB: null, reportedById: user.id, reportedAt: new Date() };
  let data;
  if (value === "PENDING") data = { status: "PENDING" as const, ...reset, reportedById: null, reportedAt: null };
  else if (value === "NOT_PLAYED") data = { status: "NOT_PLAYED" as const, ...reset };
  else {
    const score = parseResult(value);
    if (!score) backToTournament(slug, "result_not_allowed");
    data = { status: "PLAYED" as const, ...score, reportedById: user.id, reportedAt: new Date() };
  }
  await prisma.match.update({ where: { id: match.id }, data });
  backToTournament(slug, "result_saved");
}
