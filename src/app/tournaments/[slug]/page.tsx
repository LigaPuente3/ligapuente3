import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AchievementBadges } from "@/components/achievement-badges";
import { FormMessage, primaryButtonClass, secondaryButtonClass } from "@/components/forms/fields";
import { CollectionTag } from "@/components/collection-tag";
import { LeagueSection } from "@/components/league/league-section";
import { RegistrationReasonNote } from "@/components/registration-reason";
import { prisma } from "@/lib/db";
import { formatDateTimeLong, formatDay } from "@/lib/format-date";
import { can } from "@/lib/roles";
import { getCurrentUser } from "@/lib/session";
import { closeRegistration, withdrawRegistration } from "@/lib/tournament-actions";
import { guildRequirement, isPublic, registrationState } from "@/lib/tournaments";
import { getDictionary, siteVars } from "@/i18n/server";
import { format } from "@/i18n/locale";

async function loadTournament(slug: string) {
  return prisma.tournament.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      collectionCode: true,
      collectionName: true,
      description: true,
      rulesUrl: true,
      startsOn: true,
      matchDeadlineOn: true,
      status: true,
      registrationOpen: true, registrationOpensAt: true, registrationClosesAt: true,
      promotions: true,
      relegations: true,
      _count: { select: { groups: true } },
      registrations: {
        orderBy: { createdAt: "asc" },
        select: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
              achievements: { select: { type: true, count: true } },
            },
          },
        },
      },
    },
  });
}

export async function generateMetadata({ params }: PageProps<"/tournaments/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const tournament = await prisma.tournament
    .findUnique({ where: { slug }, select: { name: true, status: true } })
    .catch(() => null);
  return { title: tournament && isPublic(tournament.status) ? tournament.name : undefined };
}

export default async function TournamentPage({ params, searchParams }: PageProps<"/tournaments/[slug]">) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const [{ locale, dict }, user, tournament] = await Promise.all([getDictionary(), getCurrentUser(), loadTournament(slug)]);
  if (!tournament) notFound();
  // Los borradores solo los ven quienes gestionan torneos.
  if (!isPublic(tournament.status) && !(user && can(user.role, "tournaments.manage"))) notFound();

  const t = dict.tournaments;
  const vars = siteVars(dict);
  const players = tournament.registrations.map((r) => r.user);
  const registered = Boolean(user && players.some((p) => p.id === user.id));
  const regState = registrationState(tournament);
  const open = regState === "open";
  // Aviso de la ventana: cuándo abre (si aún no) o hasta cuándo está abierta.
  const windowNote =
    regState === "not_yet" && tournament.registrationOpensAt
      ? format(t.opensOn, { date: formatDateTimeLong(tournament.registrationOpensAt, locale) })
      : regState === "open" && tournament.registrationClosesAt
        ? format(t.closesOn, { date: formatDateTimeLong(tournament.registrationClosesAt, locale) })
        : null;
  const canClose = Boolean(user && can(user.role, "registrations.close") && open);

  let guild: ReturnType<typeof guildRequirement> = "ok";
  if (user && open && !registered) {
    const stored = await prisma.user.findUnique({ where: { id: user.id }, select: { guildMember: true } });
    guild = guildRequirement(process.env.DISCORD_GUILD_ID?.trim(), stored?.guildMember ?? null);
  }
  const inviteUrl = process.env.DISCORD_GUILD_INVITE_URL?.trim();

  const status = typeof query.status === "string" ? query.status : "";
  const messages: Record<string, { text: string; ok: boolean }> = {
    registered: { text: t.registered, ok: true },
    unregistered: { text: t.unregistered, ok: true },
    not_open: { text: t.notOpen, ok: false },
    in_group: { text: dict.league.inGroupNoWithdraw, ok: false },
    result_saved: { text: dict.league.resultSaved, ok: true },
    result_not_allowed: { text: dict.league.resultNotAllowed, ok: false },
    registration_closed: { text: t.registrationClosedNow, ok: true },
  };
  const statusMessage = messages[status] ?? null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <p>
        <Link href="/tournaments" className="inline-flex min-h-11 items-center text-sm text-muted hover:text-text">
          ← {t.title}
        </Link>
      </p>
      <h1 className="text-3xl font-bold text-wood-light">{tournament.name}</h1>
      {tournament.collectionCode || tournament.collectionName ? (
        <p className="mt-2">
          <CollectionTag code={tournament.collectionCode} name={tournament.collectionName} />
        </p>
      ) : null}
      <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
        <span>{t.status[tournament.status]}</span>
        <span className={open ? "text-wood-light" : undefined}>{open ? t.registrationOpen : t.registrationClosed}</span>
      </p>

      {user && can(user.role, "tournaments.manage") ? (
        <div className="mt-4">
          <RegistrationReasonNote tournament={tournament} dict={dict} locale={locale} />
        </div>
      ) : null}

      {statusMessage ? (
        <div className="mt-6">
          <FormMessage tone={statusMessage.ok ? "ok" : "error"} message={statusMessage.text} />
        </div>
      ) : null}

      {tournament.description ? <p className="mt-6 whitespace-pre-line leading-relaxed">{tournament.description}</p> : null}

      <dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {tournament.startsOn ? (
          <div className="rounded-lg border border-border bg-surface p-4">
            <dt className="text-sm text-muted">{t.startsOn}</dt>
            <dd className="mt-1 font-semibold">{formatDay(tournament.startsOn, locale)}</dd>
          </div>
        ) : null}
        {tournament.matchDeadlineOn ? (
          <div className="rounded-lg border border-border bg-surface p-4">
            <dt className="text-sm text-muted">{t.deadline}</dt>
            <dd className="mt-1 font-semibold">{formatDay(tournament.matchDeadlineOn, locale)}</dd>
          </div>
        ) : null}
      </dl>
      {tournament.rulesUrl ? (
        <p className="mt-4">
          <a href={tournament.rulesUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-wood-light underline hover:text-text">
            {t.rules} ↗
          </a>
        </p>
      ) : null}

      <section aria-labelledby="inscripcion" className="mt-8 rounded-lg border border-border bg-surface-2 p-5">
        <h2 id="inscripcion" className="sr-only">
          {t.register}
        </h2>
        {windowNote ? <p className="mb-3 text-sm text-muted">{windowNote}</p> : null}
        {!user ? (
          open ? (
            <div className="flex flex-wrap items-center gap-3">
              <p>{t.signInToRegister}</p>
              <Link href={`/login?next=${encodeURIComponent(`/tournaments/${slug}/register`)}`} className={primaryButtonClass + " inline-flex items-center"}>
                {dict.auth.signIn}
              </Link>
            </div>
          ) : (
            <p className="text-muted">{regState === "not_yet" ? t.notOpen : t.registrationClosed}</p>
          )
        ) : registered ? (
          <div className="flex flex-col gap-4">
            <p className="font-semibold text-wood-light">{t.youAreRegistered}</p>
            {open ? (
              <div className="flex flex-wrap items-start gap-3">
                <Link href={`/tournaments/${slug}/register`} className={secondaryButtonClass}>
                  {t.editRegistration}
                </Link>
                <form action={withdrawRegistration} className="flex flex-col gap-2">
                  <input type="hidden" name="slug" value={slug} />
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="confirm" value="yes" required className="size-5 accent-blood" />
                    {t.unregisterConfirm}
                  </label>
                  <button type="submit" className="min-h-11 self-start rounded-md border border-blood-dark px-4 text-sm hover:bg-blood-dark">
                    {t.unregister}
                  </button>
                </form>
              </div>
            ) : null}
          </div>
        ) : !open ? (
          <p className="text-muted">{regState === "not_yet" ? t.notOpen : t.registrationClosed}</p>
        ) : guild !== "ok" ? (
          <div className="flex flex-col gap-3">
            <p>{format(guild === "not_member" ? t.guildNotMember : t.guildUnknown, vars)}</p>
            {inviteUrl ? (
              <a href={inviteUrl} target="_blank" rel="noopener noreferrer" className={secondaryButtonClass + " self-start"}>
                {t.joinGuild} ↗
              </a>
            ) : null}
          </div>
        ) : (
          <Link href={`/tournaments/${slug}/register`} className={primaryButtonClass + " inline-flex items-center"}>
            {t.register}
          </Link>
        )}
        {canClose ? (
          <form action={closeRegistration} className="mt-5 flex flex-col gap-2 border-t border-border pt-4">
            <input type="hidden" name="slug" value={slug} />
            <p className="text-xs text-muted">{t.closeHint}</p>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="confirm" value="yes" required className="size-5 accent-blood" />
              {t.closeConfirm}
            </label>
            <button type="submit" className="min-h-11 self-start rounded-md border border-blood-dark px-4 text-sm hover:bg-blood-dark">
              {t.closeNow}
            </button>
          </form>
        ) : null}
      </section>

      <LeagueSection
        tournamentId={tournament.id}
        tournamentStatus={tournament.status}
        promotions={tournament.promotions}
        relegations={tournament.relegations}
        user={user}
        dict={dict}
      />

      {/* Plegable: abierta mientras se inscribe la gente; cerrada cuando ya hay grupos (la liguilla es lo importante). */}
      <details open={tournament._count.groups === 0} className="mt-8 rounded-lg border border-border bg-surface">
        <summary className="min-h-11 cursor-pointer px-4 py-3 text-lg font-semibold">
          {format(t.players, { count: players.length })}
        </summary>
        <div className="px-4 pb-4">
          {players.length === 0 ? (
            <p className="text-muted">{t.noPlayers}</p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {players.map((player) => (
                <li
                  key={player.id}
                  className="flex min-w-0 max-w-full items-center gap-2 rounded-full border border-border bg-surface-2 py-1 pr-3 pl-1 text-sm"
                >
                  {player.image ? (
                    <Image src={player.image} alt="" width={24} height={24} className="size-6 shrink-0 rounded-full" />
                  ) : (
                    <span className="size-6 shrink-0" aria-hidden="true" />
                  )}
                  <span className="min-w-0 truncate">{player.name}</span>
                  <AchievementBadges achievements={player.achievements} dict={dict} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </details>
    </div>
  );
}
