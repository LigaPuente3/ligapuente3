import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AchievementBadges } from "@/components/achievement-badges";
import { FormMessage, inputClass, primaryButtonClass } from "@/components/forms/fields";
import { TournamentForm } from "@/components/forms/tournament-form";
import { RegistrationReasonNote } from "@/components/registration-reason";
import { tierBadgeClass } from "@/components/league/tier-styles";
import { prisma } from "@/lib/db";
import { formatDateTime, toDateInput } from "@/lib/format-date";
import { divisionTiers } from "@/lib/league";
import { utcToMadridInput } from "@/lib/madrid-time";
import { requirePermission } from "@/lib/session";
import { adminRegister, deleteTournament, saveTournament } from "@/lib/tournament-actions";
import { previousParticipations } from "@/lib/tournaments";
import { getDictionary } from "@/i18n/server";
import { format } from "@/i18n/locale";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getDictionary();
  return { title: dict.adminTournaments.edit, robots: { index: false } };
}

export default async function EditTournamentPage({ params, searchParams }: PageProps<"/admin/tournaments/[id]">) {
  const { id } = await params;
  await requirePermission("tournaments.manage", `/admin/tournaments/${id}`);
  const query = await searchParams;
  // Buscador del alta manual: por nombre o por ID de Discord.
  const manualQuery = typeof query.mq === "string" ? query.mq.trim().slice(0, 100) : "";
  const [{ locale, dict }, tournament, candidates] = await Promise.all([
    getDictionary(),
    prisma.tournament.findUnique({
      where: { id },
      include: {
        registrations: {
          orderBy: { user: { name: "asc" } },
          include: {
            user: { select: { name: true, image: true, discordId: true, achievements: { select: { type: true, count: true } } } },
          },
        },
      },
    }),
    // Personas que ya han entrado en la web, no están inscritas y coinciden con la búsqueda.
    manualQuery
      ? prisma.user.findMany({
          where: {
            registrations: { none: { tournamentId: id } },
            OR: [{ name: { contains: manualQuery, mode: "insensitive" } }, { discordId: { startsWith: manualQuery } }],
          },
          orderBy: { name: "asc" },
          take: 20,
          select: { id: true, name: true, image: true, discordId: true },
        })
      : Promise.resolve([]),
  ]);
  if (!tournament) notFound();
  const t = dict.adminTournaments;
  const f = dict.tournaments.form;
  const l = dict.league;

  const defaults = {
    name: tournament.name,
    description: tournament.description ?? "",
    collectionCode: tournament.collectionCode ?? "",
    collectionName: tournament.collectionName ?? "",
    rulesUrl: tournament.rulesUrl ?? "",
    startsOn: toDateInput(tournament.startsOn),
    matchDeadlineOn: toDateInput(tournament.matchDeadlineOn),
    status: tournament.status,
    registrationOpen: tournament.registrationOpen ? "on" : "",
    registrationOpensAt: utcToMadridInput(tournament.registrationOpensAt),
    registrationClosesAt: utcToMadridInput(tournament.registrationClosesAt),
    promotions: String(tournament.promotions),
    relegations: String(tournament.relegations),
  };
  const yesNo = (value: boolean | null) => (value === null ? "—" : value ? f.yes : f.no);

  const status = typeof query.status === "string" ? query.status : "";
  const manualMessage = status in t.manualStatus ? t.manualStatus[status as keyof typeof t.manualStatus] : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <p>
        <Link href="/admin/tournaments" className="inline-flex min-h-11 items-center text-sm text-muted hover:text-text">
          ← {t.title}
        </Link>
      </p>
      <h1 className="text-3xl font-bold text-wood-light">{tournament.name}</h1>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <Link href={`/admin/tournaments/${tournament.id}/groups`} className={`${primaryButtonClass} inline-flex items-center`}>
          {dict.adminGroups.link}
        </Link>
        <Link href={`/tournaments/${tournament.slug}`} className="inline-flex min-h-11 items-center text-sm text-wood-light underline hover:text-text">
          {t.publicLink}
        </Link>
      </div>
      {status === "saved" ? (
        <div className="mt-4">
          <FormMessage tone="ok" message={t.saved} />
        </div>
      ) : status === "not_draft" ? (
        <div className="mt-4">
          <FormMessage message={t.errors.not_draft} />
        </div>
      ) : null}

      <div className="mt-6 max-w-2xl">
        <RegistrationReasonNote tournament={tournament} dict={dict} locale={locale} />
      </div>

      <section aria-labelledby="editar" className="mt-8 max-w-2xl">
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

      <section aria-labelledby="alta-manual-titulo" id="alta-manual" className="mt-12 max-w-2xl scroll-mt-4 rounded-lg border border-border bg-surface-2 p-5">
        <h2 id="alta-manual-titulo" className="text-xl font-semibold">
          {t.manualTitle}
        </h2>
        <p className="mt-2 text-sm text-muted">{t.manualIntro}</p>
        {manualMessage ? (
          <div className="mt-4">
            <FormMessage tone={status === "added" ? "ok" : "error"} message={manualMessage} />
          </div>
        ) : null}
        <form action={`/admin/tournaments/${tournament.id}#alta-manual`} className="mt-4 flex flex-wrap gap-2">
          <label htmlFor="manual-search" className="sr-only">
            {t.manualSearch}
          </label>
          <input
            id="manual-search"
            name="mq"
            defaultValue={manualQuery}
            placeholder={t.manualSearch}
            className={`${inputClass} min-w-0 flex-1`}
          />
          <button type="submit" className="min-h-11 rounded-md border border-border px-4 text-sm hover:border-wood">
            {dict.admin.users.searchButton}
          </button>
        </form>
        {!manualQuery ? null : candidates.length === 0 ? (
          <p className="mt-4 text-muted">{t.manualNoResults}</p>
        ) : (
          <form action={adminRegister} className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <input type="hidden" name="tournamentId" value={tournament.id} />
            <fieldset className="sm:col-span-2">
              <legend className="mb-2 font-semibold">{t.manualUser}</legend>
              <ul className="flex flex-col gap-2">
                {candidates.map((u) => (
                  <li key={u.id}>
                    <label className="flex min-h-11 min-w-0 items-center gap-3 rounded-md border border-border bg-surface px-3 py-2">
                      <input type="radio" name="userId" value={u.id} required className="size-5 shrink-0 accent-wood" />
                      {u.image ? (
                        <Image src={u.image} alt="" width={28} height={28} className="size-7 shrink-0 rounded-full" />
                      ) : null}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold">{u.name}</span>
                        <span className="block break-all text-xs text-muted">ID {u.discordId}</span>
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </fieldset>
            <div>
              <label htmlFor="manual-previous" className="mb-1 block font-semibold">
                {t.columns.previous}
              </label>
              <select id="manual-previous" name="previousParticipation" required defaultValue="" className={inputClass}>
                <option value="" disabled>
                  —
                </option>
                {previousParticipations.map((p) => (
                  <option key={p} value={p}>
                    {f.participation[p]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="manual-streaming" className="mb-1 block font-semibold">
                {t.columns.streaming}
              </label>
              <select id="manual-streaming" name="streamingConsent" required defaultValue="" className={inputClass}>
                <option value="" disabled>
                  —
                </option>
                <option value="yes">{f.yes}</option>
                <option value="no">{f.no}</option>
              </select>
            </div>
            <div>
              <label htmlFor="manual-city" className="mb-1 block font-semibold">
                {t.manualCity}
              </label>
              <input id="manual-city" name="city" maxLength={80} className={inputClass} />
            </div>
            <div>
              <label htmlFor="manual-country" className="mb-1 block font-semibold">
                {t.manualCountry}
              </label>
              <input id="manual-country" name="country" maxLength={80} className={inputClass} />
            </div>
            <div>
              <label htmlFor="manual-division" className="mb-1 block font-semibold">
                {t.manualDivision}
              </label>
              <select id="manual-division" name="division" defaultValue="" className={inputClass}>
                <option value="">{dict.adminGroups.noDivision}</option>
                {divisionTiers.map((tier) => (
                  <option key={tier} value={tier}>
                    {l.divisions[tier]}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button type="submit" className={primaryButtonClass}>
                {t.manualSubmit}
              </button>
            </div>
          </form>
        )}
      </section>

      {/* Inscripciones a ancho completo, en fichas compactas. */}
      <section aria-labelledby="inscripciones" className="mt-12">
        <h2 id="inscripciones" className="mb-4 text-xl font-semibold">
          {format(t.registrations, { count: tournament.registrations.length })}
        </h2>
        {tournament.registrations.length === 0 ? (
          <p className="text-muted">{t.noRegistrations}</p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {tournament.registrations.map((r) => (
              <li key={r.id} className="min-w-0 rounded-lg border border-border bg-surface p-3 text-sm">
                <div className="flex min-w-0 items-center gap-2">
                  {r.user.image ? (
                    <Image src={r.user.image} alt="" width={28} height={28} className="size-7 shrink-0 rounded-full" />
                  ) : null}
                  <span className="min-w-0 flex-1 truncate font-semibold">{r.user.name}</span>
                  {r.division ? (
                    <span
                      title={l.divisions[r.division]}
                      className={`inline-flex size-6 shrink-0 items-center justify-center rounded text-xs font-bold ${tierBadgeClass[r.division]}`}
                    >
                      {l.tierLetters[r.division]}
                    </span>
                  ) : null}
                </div>
                <AchievementBadges achievements={r.user.achievements} dict={dict} />
                <dl className="mt-2 grid grid-cols-1 gap-y-0.5 text-xs">
                  <div className="flex flex-wrap gap-x-1">
                    <dt className="text-muted">{t.columns.previous}:</dt>
                    <dd>{f.participation[r.previousParticipation]}</dd>
                  </div>
                  {r.firstTimeBigWin !== null ? (
                    <div className="flex flex-wrap gap-x-1">
                      <dt className="text-muted">{t.columns.firstTimeBigWin}:</dt>
                      <dd>{yesNo(r.firstTimeBigWin)}</dd>
                    </div>
                  ) : null}
                  <div className="flex flex-wrap gap-x-1">
                    <dt className="text-muted">{t.columns.streaming}:</dt>
                    <dd>{yesNo(r.streamingConsent)}</dd>
                  </div>
                  <div className="flex flex-wrap gap-x-1">
                    <dt className="text-muted">{t.columns.location}:</dt>
                    <dd className="break-words">{[r.city, r.country].filter(Boolean).join(", ") || "—"}</dd>
                  </div>
                  <div className="flex flex-wrap gap-x-1">
                    <dt className="text-muted">{t.columns.date}:</dt>
                    <dd>{formatDateTime(r.createdAt, locale)}</dd>
                  </div>
                  <div className="flex flex-wrap gap-x-1">
                    <dt className="text-muted">ID:</dt>
                    <dd className="break-all">{r.user.discordId}</dd>
                  </div>
                </dl>
              </li>
            ))}
          </ul>
        )}
      </section>

      {tournament.status === "DRAFT" ? (
        <section aria-labelledby="borrar" className="mt-12 max-w-2xl rounded-lg border border-blood-dark bg-surface-2 p-5">
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
