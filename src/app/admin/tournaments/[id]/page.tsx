import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AchievementBadges } from "@/components/achievement-badges";
import { FormMessage, primaryButtonClass } from "@/components/forms/fields";
import { TournamentForm } from "@/components/forms/tournament-form";
import { prisma } from "@/lib/db";
import { formatDateTime, toDateInput } from "@/lib/format-date";
import { requirePermission } from "@/lib/session";
import { deleteTournament, saveTournament } from "@/lib/tournament-actions";
import { getDictionary } from "@/i18n/server";
import { format } from "@/i18n/locale";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getDictionary();
  return { title: dict.adminTournaments.edit, robots: { index: false } };
}

export default async function EditTournamentPage({ params, searchParams }: PageProps<"/admin/tournaments/[id]">) {
  const { id } = await params;
  await requirePermission("tournaments.manage", `/admin/tournaments/${id}`);
  const [{ locale, dict }, query, tournament] = await Promise.all([
    getDictionary(),
    searchParams,
    prisma.tournament.findUnique({
      where: { id },
      include: {
        registrations: {
          orderBy: { createdAt: "asc" },
          include: {
            user: { select: { name: true, image: true, discordId: true, achievements: { select: { type: true, count: true } } } },
          },
        },
      },
    }),
  ]);
  if (!tournament) notFound();
  const t = dict.adminTournaments;
  const f = dict.tournaments.form;

  const defaults = {
    name: tournament.name,
    description: tournament.description ?? "",
    rulesUrl: tournament.rulesUrl ?? "",
    startsOn: toDateInput(tournament.startsOn),
    matchDeadlineOn: toDateInput(tournament.matchDeadlineOn),
    status: tournament.status,
    registrationOpen: tournament.registrationOpen ? "on" : "",
    promotions: String(tournament.promotions),
    relegations: String(tournament.relegations),
  };
  const yesNo = (value: boolean | null) => (value === null ? "—" : value ? f.yes : f.no);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <p>
        <Link href="/admin/tournaments" className="inline-flex min-h-11 items-center text-sm text-muted hover:text-text">
          ← {t.title}
        </Link>
      </p>
      <h1 className="text-3xl font-bold text-wood-light">{tournament.name}</h1>
      <p>
        <Link href={`/tournaments/${tournament.slug}`} className="inline-flex min-h-11 items-center text-sm text-wood-light underline hover:text-text">
          {t.publicLink} (/tournaments/{tournament.slug})
        </Link>
      </p>
      <p className="mt-2">
        <Link href={`/admin/tournaments/${tournament.id}/groups`} className={`${primaryButtonClass} inline-flex items-center`}>
          {dict.adminGroups.link}
        </Link>
      </p>
      {query.status === "saved" ? (
        <div className="mt-4">
          <FormMessage tone="ok" message={t.saved} />
        </div>
      ) : query.status === "not_draft" ? (
        <div className="mt-4">
          <FormMessage message={t.errors.not_draft} />
        </div>
      ) : null}

      <div className="mt-8 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <section aria-labelledby="editar">
          <h2 id="editar" className="mb-4 text-xl font-semibold">
            {t.edit}
          </h2>
          <TournamentForm
            key={tournament.updatedAt.toISOString()}
            action={saveTournament.bind(null, tournament.id)}
            texts={t}
            statusNames={dict.tournaments.status}
            defaults={defaults}
          />
        </section>

        <section aria-labelledby="inscripciones" className="min-w-0">
          <h2 id="inscripciones" className="mb-4 text-xl font-semibold">
            {format(t.registrations, { count: tournament.registrations.length })}
          </h2>
          {tournament.registrations.length === 0 ? (
            <p className="text-muted">{t.noRegistrations}</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {tournament.registrations.map((r) => (
                <li key={r.id} className="rounded-lg border border-border bg-surface p-4">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    {r.user.image ? (
                      <Image src={r.user.image} alt="" width={32} height={32} className="size-8 shrink-0 rounded-full" />
                    ) : null}
                    <span className="min-w-0 truncate font-semibold">{r.user.name}</span>
                    <AchievementBadges achievements={r.user.achievements} dict={dict} />
                  </div>
                  <dl className="mt-3 grid grid-cols-1 gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
                    <div>
                      <dt className="text-muted">{t.columns.previous}</dt>
                      <dd>{f.participation[r.previousParticipation]}</dd>
                    </div>
                    <div>
                      <dt className="text-muted">{t.columns.firstTimeBigWin}</dt>
                      <dd>{yesNo(r.firstTimeBigWin)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted">{t.columns.streaming}</dt>
                      <dd>{yesNo(r.streamingConsent)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted">{t.columns.location}</dt>
                      <dd className="break-words">
                        {r.city}, {r.country}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted">{t.columns.date}</dt>
                      <dd>{formatDateTime(r.createdAt, locale)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted">ID</dt>
                      <dd className="break-all">{r.user.discordId}</dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {tournament.status === "DRAFT" ? (
        <section aria-labelledby="borrar" className="mt-12 rounded-lg border border-blood-dark bg-surface-2 p-5">
          <h2 id="borrar" className="font-semibold text-blood">
            {t.delete}
          </h2>
          <p className="mt-2 text-sm">{t.deleteHint}</p>
          <form action={deleteTournament} className="mt-4 flex flex-col gap-3">
            <input type="hidden" name="id" value={tournament.id} />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="confirm" value="yes" required className="size-5 accent-blood" />
              {t.deleteConfirm}
            </label>
            <button type="submit" className="min-h-11 self-start rounded-md bg-blood-dark px-4 font-semibold hover:bg-blood">
              {t.delete}
            </button>
          </form>
        </section>
      ) : null}
    </div>
  );
}
