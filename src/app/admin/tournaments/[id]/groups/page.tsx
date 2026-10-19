import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FormMessage, inputClass, primaryButtonClass } from "@/components/forms/fields";
import { prisma } from "@/lib/db";
import { divisionTiers } from "@/lib/league";
import { addToGroup, drawDivision, removeFromGroup, resetDivision, setDivision } from "@/lib/league-actions";
import { requirePermission } from "@/lib/session";
import { getDictionary } from "@/i18n/server";
import { format } from "@/i18n/locale";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getDictionary();
  return { title: dict.adminGroups.title, robots: { index: false } };
}

export default async function TournamentGroupsPage({ params, searchParams }: PageProps<"/admin/tournaments/[id]/groups">) {
  const { id } = await params;
  await requirePermission("registrations.manage", `/admin/tournaments/${id}/groups`);
  const [{ dict }, query, tournament] = await Promise.all([
    getDictionary(),
    searchParams,
    prisma.tournament.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        registrations: {
          orderBy: { user: { name: "asc" } },
          select: {
            id: true,
            division: true,
            user: { select: { name: true } },
            groupMember: { select: { id: true, groupId: true } },
          },
        },
        groups: {
          orderBy: [{ division: "asc" }, { number: "asc" }],
          select: {
            id: true,
            division: true,
            number: true,
            _count: { select: { matches: { where: { status: { not: "PENDING" } } } } },
          },
        },
      },
    }),
  ]);
  if (!tournament) notFound();
  const t = dict.adminGroups;
  const l = dict.league;
  const status = typeof query.status === "string" ? query.status : "";
  const statusText = status in t.status ? t.status[status as keyof typeof t.status] : null;
  const okStatuses = ["saved", "drawn", "reset", "added", "removed"];

  const unassigned = tournament.registrations.filter((r) => r.division === null);
  const groupLabel = (g: { division: (typeof divisionTiers)[number]; number: number }) =>
    format(l.groupName, { division: l.divisions[g.division], number: g.number });
  const divisionSelect = (registrationId: string, current: string | null) => (
    <form action={setDivision} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="tournamentId" value={tournament.id} />
      <input type="hidden" name="registrationId" value={registrationId} />
      <select name="division" defaultValue={current ?? ""} aria-label={t.noDivision} className={`${inputClass} w-auto`}>
        <option value="">{t.noDivision}</option>
        {divisionTiers.map((tier) => (
          <option key={tier} value={tier}>
            {l.divisions[tier]}
          </option>
        ))}
      </select>
      <button type="submit" className="min-h-11 rounded-md border border-border px-3 text-sm hover:border-wood">
        {t.assign}
      </button>
    </form>
  );

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <p>
        <Link href={`/admin/tournaments/${tournament.id}`} className="inline-flex min-h-11 items-center text-sm text-muted hover:text-text">
          ← {tournament.name}
        </Link>
      </p>
      <h1 className="text-3xl font-bold text-wood-light">{t.title}</h1>
      <p className="mt-3 text-muted">{t.intro}</p>
      {statusText ? (
        <div className="mt-6">
          <FormMessage tone={okStatuses.includes(status) ? "ok" : "error"} message={statusText} />
        </div>
      ) : null}

      <section aria-labelledby="sin-division" className="mt-8">
        <h2 id="sin-division" className="text-xl font-semibold">
          {format(t.unassigned, { count: unassigned.length })}
        </h2>
        {unassigned.length === 0 ? (
          <p className="mt-2 text-muted">{t.allAssigned}</p>
        ) : (
          <ul className="mt-4 flex flex-col gap-2">
            {unassigned.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-surface p-3">
                <span className="min-w-0 truncate">{r.user.name}</span>
                {divisionSelect(r.id, null)}
              </li>
            ))}
          </ul>
        )}
      </section>

      {divisionTiers.map((tier) => {
        const players = tournament.registrations.filter((r) => r.division === tier);
        const groups = tournament.groups.filter((g) => g.division === tier);
        const withoutGroup = players.filter((p) => !p.groupMember);
        const hasResults = groups.some((g) => g._count.matches > 0);
        if (players.length === 0 && groups.length === 0) return null;
        return (
          <section key={tier} aria-labelledby={`div-${tier}`} className="mt-10 rounded-lg border border-border bg-surface-2 p-5">
            <h2 id={`div-${tier}`} className="text-xl font-semibold text-wood-light">
              {l.divisions[tier]}{" "}
              <span className="text-sm font-normal text-muted">({format(t.playerCount, { count: players.length })})</span>
            </h2>

            {groups.length === 0 ? (
              <form action={drawDivision} className="mt-4 flex flex-col gap-3">
                <input type="hidden" name="tournamentId" value={tournament.id} />
                <input type="hidden" name="division" value={tier} />
                <div className="flex flex-wrap items-end gap-3">
                  <div>
                    <label htmlFor={`groups-${tier}`} className="mb-1 block text-sm font-semibold">
                      {t.groupCount}
                    </label>
                    <input
                      id={`groups-${tier}`}
                      name="groupCount"
                      type="number"
                      min={1}
                      max={Math.max(1, Math.floor(players.length / 2))}
                      defaultValue={1}
                      inputMode="numeric"
                      className={`${inputClass} w-24`}
                    />
                  </div>
                  <button type="submit" className={primaryButtonClass} disabled={players.length < 2}>
                    {t.draw}
                  </button>
                </div>
                <p className="text-sm text-muted">{t.drawHint}</p>
              </form>
            ) : (
              <>
                <ul className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                  {groups.map((group) => {
                    const members = players.filter((p) => p.groupMember?.groupId === group.id);
                    return (
                      <li key={group.id} className="rounded-md border border-border bg-surface p-3">
                        <h3 className="font-semibold">{groupLabel(group)}</h3>
                        <ul className="mt-2 flex flex-col gap-1">
                          {members.map((m) => (
                            <li key={m.id} className="flex items-center justify-between gap-2">
                              <span className="min-w-0 truncate">{m.user.name}</span>
                              <form action={removeFromGroup}>
                                <input type="hidden" name="tournamentId" value={tournament.id} />
                                <input type="hidden" name="memberId" value={m.groupMember?.id} />
                                <button type="submit" className="min-h-11 px-2 text-sm text-muted underline hover:text-blood">
                                  {t.remove}
                                </button>
                              </form>
                            </li>
                          ))}
                        </ul>
                      </li>
                    );
                  })}
                </ul>
                <p className="mt-2 text-xs text-muted">{t.removeHint}</p>

                {withoutGroup.length > 0 ? (
                  <div className="mt-6">
                    <h3 className="font-semibold">{t.notInGroup}</h3>
                    <ul className="mt-2 flex flex-col gap-2">
                      {withoutGroup.map((p) => (
                        <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-surface p-3">
                          <span className="min-w-0 truncate">{p.user.name}</span>
                          <form action={addToGroup} className="flex flex-wrap items-center gap-2">
                            <input type="hidden" name="tournamentId" value={tournament.id} />
                            <input type="hidden" name="registrationId" value={p.id} />
                            <select name="groupId" aria-label={t.addTo} className={`${inputClass} w-auto`}>
                              {groups.map((g) => (
                                <option key={g.id} value={g.id}>
                                  {groupLabel(g)}
                                </option>
                              ))}
                            </select>
                            <button type="submit" className="min-h-11 rounded-md border border-border px-3 text-sm hover:border-wood">
                              {t.add}
                            </button>
                          </form>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {!hasResults ? (
                  <form action={resetDivision} className="mt-6 flex flex-col gap-2 border-t border-border pt-4">
                    <input type="hidden" name="tournamentId" value={tournament.id} />
                    <input type="hidden" name="division" value={tier} />
                    <p className="text-sm text-muted">{t.resetHint}</p>
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" name="confirm" value="yes" required className="size-5 accent-blood" />
                      {t.resetConfirm}
                    </label>
                    <button type="submit" className="min-h-11 self-start rounded-md border border-blood-dark px-3 text-sm hover:bg-blood-dark">
                      {t.reset}
                    </button>
                  </form>
                ) : null}
              </>
            )}

            {players.length > 0 ? (
              <details className="mt-6">
                <summary className="min-h-11 cursor-pointer py-2 text-sm text-muted">{t.changeDivision}</summary>
                <ul className="mt-2 flex flex-col gap-2">
                  {players.map((p) => (
                    <li key={p.id} className="flex flex-wrap items-center justify-between gap-2">
                      <span className="min-w-0 truncate">{p.user.name}</span>
                      {p.groupMember ? null : divisionSelect(p.id, tier)}
                    </li>
                  ))}
                </ul>
              </details>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
