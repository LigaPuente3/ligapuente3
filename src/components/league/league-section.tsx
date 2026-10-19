import Image from "next/image";
import { AchievementBadges } from "@/components/achievement-badges";
import { inputClass } from "@/components/forms/fields";
import type { AchievementType } from "@/lib/achievements";
import { prisma } from "@/lib/db";
import { canReportResult, computeStandings, divisionTiers, moderatorResults, zoneFor, type Zone } from "@/lib/league";
import { reportResult, setMatchResult } from "@/lib/league-actions";
import { ReportResultForm } from "./report-result-form";
import { tierBadgeClass, zoneDot, zoneRow } from "./tier-styles";
import { can } from "@/lib/roles";
import type { CurrentUser } from "@/lib/session";
import type { Dictionary } from "@/i18n/es";
import { format } from "@/i18n/locale";

type Player = { name: string; image: string | null; achievements: { type: AchievementType; count: number }[] };

async function loadGroups(tournamentId: string) {
  return prisma.group.findMany({
    where: { tournamentId },
    orderBy: [{ division: "asc" }, { number: "asc" }],
    select: {
      id: true,
      division: true,
      number: true,
      members: {
        orderBy: { createdAt: "asc" },
        select: {
          registration: {
            select: {
              id: true,
              user: {
                select: { id: true, name: true, image: true, achievements: { select: { type: true, count: true } } },
              },
            },
          },
        },
      },
      matches: {
        orderBy: { createdAt: "asc" },
        select: { id: true, status: true, gamesA: true, gamesB: true, playerAId: true, playerBId: true },
      },
    },
  });
}

function PlayerName({ player, dict, deleted }: { player: Player | undefined; dict: Dictionary; deleted: string }) {
  if (!player) return <span className="italic text-muted">{deleted}</span>;
  return (
    <span className="flex min-w-0 max-w-full items-center gap-2">
      {player.image ? <Image src={player.image} alt="" width={24} height={24} className="size-6 shrink-0 rounded-full" /> : null}
      <span className="min-w-0 truncate">{player.name}</span>
      <AchievementBadges achievements={player.achievements} dict={dict} />
    </span>
  );
}

/** Liguilla del torneo: tus partidos pendientes y, por división, la clasificación y los partidos de cada grupo. */
export async function LeagueSection({
  tournamentId,
  tournamentStatus,
  promotions,
  relegations,
  user,
  dict,
}: {
  tournamentId: string;
  tournamentStatus: string;
  promotions: number;
  relegations: number;
  user: CurrentUser | null;
  dict: Dictionary;
}) {
  const groups = await loadGroups(tournamentId);
  const l = dict.league;
  if (groups.length === 0) {
    return (
      <section aria-labelledby="liguilla-title" id="liguilla" className="mt-10 scroll-mt-4">
        <h2 id="liguilla-title" className="text-xl font-semibold">
          {l.title}
        </h2>
        <p className="mt-2 text-muted">{l.noGroups}</p>
      </section>
    );
  }

  const players = new Map<string, Player>();
  let myRegistrationId: string | null = null;
  for (const group of groups) {
    for (const { registration } of group.members) {
      players.set(registration.id, registration.user);
      if (user && registration.user.id === user.id) myRegistrationId = registration.id;
    }
  }
  const isModerator = Boolean(user && can(user.role, "results.manage"));
  // Todos mis partidos: los pendientes con formulario y los ya anotados con su resultado (desde mi lado).
  const myMatches = myRegistrationId
    ? groups.flatMap((g) =>
        g.matches
          .filter((m) => m.playerAId === myRegistrationId || m.playerBId === myRegistrationId)
          .map((m) => ({
            match: m,
            mine: m.playerAId === myRegistrationId ? ("A" as const) : ("B" as const),
            canReport: canReportResult(m, myRegistrationId, tournamentStatus) !== null,
          })),
      )
    : [];
  const myPendingCount = myMatches.filter((x) => x.match.status === "PENDING").length;
  const reportTexts = {
    own: l.reportOwn,
    rival: l.reportRival,
    save: l.reportSave,
    invalid: l.reportInvalid,
    notAllowed: l.resultNotAllowed,
    confirm: l.reportConfirm,
    confirmYes: l.reportConfirmYes,
    confirmNo: l.reportConfirmNo,
  };
  const groupName = (g: { division: (typeof divisionTiers)[number]; number: number }) =>
    format(l.groupName, { division: l.divisions[g.division], number: g.number });
  const score = (m: { status: string; gamesA: number | null; gamesB: number | null }) =>
    m.status === "PLAYED" ? `${m.gamesA}-${m.gamesB}` : m.status === "NOT_PLAYED" ? l.notPlayed : l.pending;

  return (
    <section aria-labelledby="liguilla-title" id="liguilla" className="mt-10 scroll-mt-4">
      <h2 id="liguilla-title" className="text-xl font-semibold">
        {l.title}
      </h2>
      <p className="mt-2 text-sm text-muted">{l.rules}</p>

      {myRegistrationId && myMatches.length > 0 ? (
        <div className="mt-6 rounded-lg border border-wood bg-surface-2 p-4">
          <h3 className="font-semibold text-wood-light">{l.myMatches}</h3>
          <p className="mt-1 text-sm text-muted">{format(l.myPendingCount, { count: myPendingCount })}</p>
          <ul className="mt-3 flex flex-col gap-3">
            {myMatches.map(({ match, mine, canReport }) => {
              const rivalId = mine === "A" ? match.playerBId : match.playerAId;
              const own = mine === "A" ? match.gamesA : match.gamesB;
              const rival = mine === "A" ? match.gamesB : match.gamesA;
              return (
                <li key={match.id} className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 first:border-t-0 first:pt-0">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="text-muted">{l.vs}</span>
                    <PlayerName player={rivalId ? players.get(rivalId) : undefined} dict={dict} deleted={l.deletedPlayer} />
                  </span>
                  {canReport ? (
                    <ReportResultForm
                      action={reportResult}
                      matchId={match.id}
                      rivalName={(rivalId ? players.get(rivalId)?.name : undefined) ?? l.deletedPlayer}
                      texts={reportTexts}
                    />
                  ) : match.status === "PLAYED" ? (
                    <span className="text-sm">
                      <span className={`font-semibold ${(own ?? 0) > (rival ?? 0) ? "text-wood-light" : "text-muted"}`}>
                        {own}-{rival}
                      </span>{" "}
                      <span className="text-muted">· {(own ?? 0) > (rival ?? 0) ? l.youWon : (own ?? 0) < (rival ?? 0) ? l.youLost : l.draw}</span>
                    </span>
                  ) : (
                    <span className="text-sm text-muted">{match.status === "NOT_PLAYED" ? l.notPlayed : l.pending}</span>
                  )}
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-xs text-muted">{l.reportHint}</p>
        </div>
      ) : null}

      {divisionTiers.map((tier, index) => {
        const tierGroups = groups.filter((g) => g.division === tier);
        if (tierGroups.length === 0) return null;
        return (
          <details key={tier} open={index === 0 || tierGroups.some((g) => g.members.some((m) => m.registration.id === myRegistrationId))} className="mt-6 rounded-lg border border-border bg-surface">
            <summary className="flex min-h-11 cursor-pointer items-center gap-2 px-4 py-3 text-lg font-semibold">
              <span aria-hidden="true" className={`inline-flex size-7 items-center justify-center rounded text-sm font-bold ${tierBadgeClass[tier]}`}>
                {l.tierLetters[tier]}
              </span>
              {l.divisions[tier]}
            </summary>
            <div className="flex flex-col gap-8 px-4 pb-5">
              {tierGroups.map((group) => {
                const memberIds = group.members.map((m) => m.registration.id);
                const rows = computeStandings(memberIds, group.matches);
                const zones = rows.map((row) => zoneFor(tier, row.position, rows.length, promotions, relegations));
                // Leyenda: una entrada por cada zona distinta que aparece en la tabla.
                const legend = [...new Map(zones.filter((z) => z !== null).map((z) => [JSON.stringify(z), z])).values()];
                const zoneText = (z: Exclude<Zone, null>) =>
                  z.kind === "champion"
                    ? l.zones.champion
                    : format(z.kind === "promotion" ? l.zones.promotion : l.zones.relegation, { division: l.divisions[z.to] });
                const playedCount = group.matches.filter((m) => m.status === "PLAYED").length;
                return (
                  <div key={group.id}>
                    <h3 className="font-semibold">{groupName(group)}</h3>
                    <table className="mt-2 w-full table-fixed border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-border text-left text-muted">
                          <th scope="col" className="w-8 py-2">{l.columns.position}</th>
                          <th scope="col" className="py-2">{l.columns.player}</th>
                          <th scope="col" className="w-9 py-2 text-center"><abbr title={l.columnsLong.played}>{l.columns.played}</abbr></th>
                          <th scope="col" className="hidden w-9 py-2 text-center sm:table-cell"><abbr title={l.columnsLong.won}>{l.columns.won}</abbr></th>
                          <th scope="col" className="hidden w-9 py-2 text-center sm:table-cell"><abbr title={l.columnsLong.lost}>{l.columns.lost}</abbr></th>
                          <th scope="col" className="w-14 py-2 text-center"><abbr title={l.columnsLong.games}>{l.columns.games}</abbr></th>
                          <th scope="col" className="w-10 py-2 text-center"><abbr title={l.columnsLong.points}>{l.columns.points}</abbr></th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row) => (
                          <tr
                            key={row.playerId}
                            className={`border-b border-border ${zoneRow(zones[row.position - 1] ?? null)} ${row.playerId === myRegistrationId ? "font-semibold" : ""}`}
                          >
                            <td className="py-2">{row.position}</td>
                            <td className="overflow-hidden py-2">
                              <PlayerName player={players.get(row.playerId)} dict={dict} deleted={l.deletedPlayer} />
                            </td>
                            <td className="py-2 text-center">{row.played}</td>
                            <td className="hidden py-2 text-center sm:table-cell">{row.won}</td>
                            <td className="hidden py-2 text-center sm:table-cell">{row.lost}</td>
                            <td className="py-2 text-center">
                              {row.gamesWon}-{row.gamesLost}
                            </td>
                            <td className="py-2 text-center font-semibold">{row.points}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {legend.length > 0 ? (
                      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                        {legend.map((z) => (
                          <li key={JSON.stringify(z)} className="flex items-center gap-1">
                            <span aria-hidden="true" className={`inline-block size-3 rounded-sm ${zoneDot(z)}`} />
                            {zoneText(z)}
                          </li>
                        ))}
                      </ul>
                    ) : null}

                    <details className="mt-3">
                      <summary className="min-h-11 cursor-pointer py-2 text-sm text-muted">
                        {format(l.matches, { played: playedCount, total: group.matches.length })}
                      </summary>
                      <ul className="mt-2 flex flex-col gap-2">
                        {group.matches.map((match) => (
                          <li key={match.id} className="rounded-md border border-border bg-surface-2 p-3 text-sm">
                            <div className="grid grid-cols-1 items-center gap-1 sm:grid-cols-[1fr_auto_1fr] sm:gap-3">
                              <PlayerName player={match.playerAId ? players.get(match.playerAId) : undefined} dict={dict} deleted={l.deletedPlayer} />
                              <span className={`font-semibold sm:text-center ${match.status === "PLAYED" ? "text-wood-light" : "text-muted"}`}>
                                {score(match)}
                              </span>
                              <span className="sm:text-right">
                                <PlayerName player={match.playerBId ? players.get(match.playerBId) : undefined} dict={dict} deleted={l.deletedPlayer} />
                              </span>
                            </div>
                            {isModerator ? (
                              <form action={setMatchResult} className="mt-2 flex flex-wrap items-center gap-2 border-t border-border pt-2">
                                <input type="hidden" name="matchId" value={match.id} />
                                <label htmlFor={`result-${match.id}`} className="text-xs text-muted">
                                  {l.moderatorResult}
                                </label>
                                <select
                                  id={`result-${match.id}`}
                                  name="result"
                                  defaultValue={match.status === "PLAYED" ? `${match.gamesA}-${match.gamesB}` : match.status}
                                  className={`${inputClass} w-auto text-sm`}
                                >
                                  <option value="PENDING">{l.moderatorOptions.PENDING}</option>
                                  {moderatorResults.map((r) => (
                                    <option key={r} value={r}>
                                      {r}
                                    </option>
                                  ))}
                                  <option value="NOT_PLAYED">{l.moderatorOptions.NOT_PLAYED}</option>
                                </select>
                                <button type="submit" className="min-h-11 rounded-md border border-border px-3 text-sm hover:border-wood">
                                  {l.save}
                                </button>
                              </form>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </details>
                  </div>
                );
              })}
            </div>
          </details>
        );
      })}
    </section>
  );
}
