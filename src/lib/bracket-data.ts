import "server-only";
import { buildBracket, resolveBracket, type BracketDef, type GroupStanding, type StoredResult } from "@/lib/bracket";
import { prisma } from "@/lib/db";
import { computeStandings, type DivisionTier } from "@/lib/league";

/** Clasificaciones de los grupos de una división, en el formato del motor del cuadro. */
export async function divisionStandings(tournamentId: string, division: DivisionTier) {
  const groups = await prisma.group.findMany({
    where: { tournamentId, division },
    orderBy: { number: "asc" },
    select: {
      number: true,
      members: { orderBy: { createdAt: "asc" }, select: { registrationId: true } },
      matches: { select: { playerAId: true, playerBId: true, status: true, gamesA: true, gamesB: true } },
    },
  });
  const pendingMatches = groups.reduce((n, g) => n + g.matches.filter((m) => m.status === "PENDING").length, 0);
  const standings: GroupStanding[] = groups.map((g) => ({
    group: g.number,
    rows: computeStandings(
      g.members.map((m) => m.registrationId),
      g.matches,
    ).map((r) => ({ playerId: r.playerId, points: r.points, gamesWon: r.gamesWon, gamesLost: r.gamesLost })),
  }));
  return { groupCount: groups.length, pendingMatches, standings };
}

/** Crea la definición del cuadro de una división (sin guardarla). */
export async function draftBracket(tournamentId: string, division: DivisionTier): Promise<BracketDef | null> {
  const { groupCount, standings } = await divisionStandings(tournamentId, division);
  if (groupCount === 0) return null;
  const def = buildBracket(standings);
  return def.matches.length > 0 ? def : null;
}

/** Cuadros del torneo con sus resultados ya resueltos. */
export async function loadBrackets(tournamentId: string) {
  const brackets = await prisma.bracket.findMany({
    where: { tournamentId },
    select: {
      id: true,
      division: true,
      definition: true,
      results: { select: { code: true, playerAId: true, playerBId: true, gamesA: true, gamesB: true } },
    },
  });
  return brackets.map((b) => {
    const def = b.definition as unknown as BracketDef;
    const stored: Record<string, StoredResult> = Object.fromEntries(
      b.results.map((r) => [r.code, { playerAId: r.playerAId, playerBId: r.playerBId, gamesA: r.gamesA, gamesB: r.gamesB }]),
    );
    return { id: b.id, division: b.division as DivisionTier, def, resolved: resolveBracket(def, stored), resultCount: b.results.length };
  });
}

// --- Campeón ---------------------------------------------------------------------------

/**
 * Si el torneo está terminado y Legendaria tiene campeón, le suma 1 a su
 * Liga Puente 3 (solo una vez por torneo). Lo opcional nunca rompe lo principal:
 * quien lo llama captura los errores.
 */
export async function awardLeagueChampion(tournamentId: string): Promise<void> {
  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    select: { status: true, leagueAwardUserId: true },
  });
  if (!tournament || tournament.status !== "FINISHED" || tournament.leagueAwardUserId) return;
  const legendary = (await loadBrackets(tournamentId)).find((b) => b.division === "LEGENDARY");
  const championRegistration = legendary?.resolved.champion;
  if (!championRegistration) return;
  const registration = await prisma.registration.findUnique({ where: { id: championRegistration }, select: { userId: true } });
  if (!registration) return;

  await prisma.$transaction([
    prisma.userAchievement.upsert({
      where: { userId_type: { userId: registration.userId, type: "LIGA_PUENTE3" } },
      create: { userId: registration.userId, type: "LIGA_PUENTE3", count: 1 },
      update: { count: { increment: 1 } },
    }),
    prisma.tournament.update({ where: { id: tournamentId }, data: { leagueAwardUserId: registration.userId } }),
  ]);
}
