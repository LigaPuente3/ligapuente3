"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { Prisma } from "@/generated/prisma/client";
import { draftBracket, divisionStandings, loadBrackets } from "@/lib/bracket-data";
import { prisma } from "@/lib/db";
import type { FormState } from "@/lib/form-state";
import { divisionTiers, parseResult, playerReportToScore, type DivisionTier } from "@/lib/league";
import { requirePermission, requireUser } from "@/lib/session";

function isTier(value: unknown): value is DivisionTier {
  return typeof value === "string" && (divisionTiers as readonly string[]).includes(value);
}

function backToGroups(tournamentId: string, status: string): never {
  revalidatePath(`/admin/tournaments/${tournamentId}/groups`);
  redirect(`/admin/tournaments/${tournamentId}/groups?status=${status}`);
}

async function revalidateTournament(tournamentId: string) {
  const t = await prisma.tournament.findUnique({ where: { id: tournamentId }, select: { slug: true } });
  if (t) revalidatePath(`/tournaments/${t.slug}`);
  return t?.slug ?? null;
}

// --- Administración ----------------------------------------------------------------

/** Genera el cuadro de una división cuando han terminado todos sus partidos de liguilla. */
export async function generateBracket(formData: FormData): Promise<void> {
  const tournamentId = String(formData.get("tournamentId") ?? "");
  await requirePermission("tournaments.manage", `/admin/tournaments/${tournamentId}/groups`);
  const division = formData.get("division");
  if (!isTier(division)) backToGroups(tournamentId, "invalid");

  const [existing, { pendingMatches }] = await Promise.all([
    prisma.bracket.count({ where: { tournamentId, division } }),
    divisionStandings(tournamentId, division),
  ]);
  if (existing > 0) backToGroups(tournamentId, "bracket_exists");
  if (pendingMatches > 0) backToGroups(tournamentId, "bracket_pending");
  const def = await draftBracket(tournamentId, division);
  if (!def) backToGroups(tournamentId, "too_few_players");

  await prisma.bracket.create({
    data: { tournamentId, division, definition: def as unknown as Prisma.InputJsonValue },
  });
  await revalidateTournament(tournamentId);
  backToGroups(tournamentId, "bracket_created");
}

/** Deshace el cuadro de una división (solo si aún no tiene resultados). */
export async function deleteBracket(formData: FormData): Promise<void> {
  const tournamentId = String(formData.get("tournamentId") ?? "");
  await requirePermission("tournaments.manage", `/admin/tournaments/${tournamentId}/groups`);
  const division = formData.get("division");
  if (!isTier(division) || formData.get("confirm") !== "yes") backToGroups(tournamentId, "invalid");
  const bracket = await prisma.bracket.findUnique({
    where: { tournamentId_division: { tournamentId, division } },
    select: { id: true, _count: { select: { results: true } } },
  });
  if (!bracket) backToGroups(tournamentId, "invalid");
  if (bracket._count.results > 0) backToGroups(tournamentId, "has_results");
  await prisma.bracket.delete({ where: { id: bracket.id } });
  await revalidateTournament(tournamentId);
  backToGroups(tournamentId, "bracket_deleted");
}

// --- Resultados ----------------------------------------------------------------------

async function loadMatchContext(bracketId: string, code: string) {
  const bracket = await prisma.bracket.findUnique({
    where: { id: bracketId },
    select: { tournamentId: true, tournament: { select: { slug: true, status: true } } },
  });
  if (!bracket) return null;
  const all = await loadBrackets(bracket.tournamentId);
  const current = all.find((b) => b.id === bracketId);
  const match = current?.resolved.matches.find((m) => m.code === code);
  if (!current || !match) return null;
  return { bracket, match };
}

/** Un jugador anota el resultado de su partido del cuadro (con el torneo en juego). */
export async function reportBracketResult(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = { ownGames: String(formData.get("ownGames") ?? ""), rivalGames: String(formData.get("rivalGames") ?? "") };
  const bracketId = String(formData.get("bracketId") ?? "");
  const code = String(formData.get("code") ?? "");
  const ctx = await loadMatchContext(bracketId, code);
  if (!ctx) return { values, message: "not_allowed" };
  const user = await requireUser(`/tournaments/${ctx.bracket.tournament.slug}`);
  const { match } = ctx;
  if (ctx.bracket.tournament.status !== "IN_PROGRESS" || match.status !== "ready") return { values, message: "not_allowed" };
  if (match.playerA.state !== "known" || match.playerB.state !== "known") return { values, message: "not_allowed" };

  const mine = await prisma.registration.findFirst({
    where: { userId: user.id, id: { in: [match.playerA.id, match.playerB.id] } },
    select: { id: true },
  });
  if (!mine) return { values, message: "not_allowed" };
  const score = playerReportToScore(values.ownGames, values.rivalGames, mine.id === match.playerA.id);
  if (!score) return { values, message: "invalid" };

  await prisma.bracketResult.upsert({
    where: { bracketId_code: { bracketId, code } },
    create: { bracketId, code, playerAId: match.playerA.id, playerBId: match.playerB.id, ...score, reportedById: user.id },
    update: { playerAId: match.playerA.id, playerBId: match.playerB.id, ...score, reportedById: user.id, reportedAt: new Date() },
  });
  revalidatePath(`/tournaments/${ctx.bracket.tournament.slug}`);
  return { message: "saved" };
}

/** Moderadores: poner, corregir o borrar el resultado de un partido del cuadro. */
export async function setBracketResult(formData: FormData): Promise<void> {
  const bracketId = String(formData.get("bracketId") ?? "");
  const code = String(formData.get("code") ?? "");
  const ctx = await loadMatchContext(bracketId, code);
  if (!ctx) redirect("/tournaments");
  const slug = ctx.bracket.tournament.slug;
  const user = await requirePermission("results.manage", `/tournaments/${slug}`);
  const back: (status: string) => never = (status) => {
    revalidatePath(`/tournaments/${slug}`);
    redirect(`/tournaments/${slug}?status=${status}#eliminatorias`);
  };
  const { match } = ctx;
  const value = formData.get("result");

  if (value === "PENDING") {
    await prisma.bracketResult.deleteMany({ where: { bracketId, code } });
    back("result_saved");
  }
  const score = parseResult(value);
  if (!score || match.playerA.state !== "known" || match.playerB.state !== "known") back("result_not_allowed");
  await prisma.bracketResult.upsert({
    where: { bracketId_code: { bracketId, code } },
    create: { bracketId, code, playerAId: match.playerA.id, playerBId: match.playerB.id, ...score, reportedById: user.id },
    update: { playerAId: match.playerA.id, playerBId: match.playerB.id, ...score, reportedById: user.id, reportedAt: new Date() },
  });
  back("result_saved");
}
