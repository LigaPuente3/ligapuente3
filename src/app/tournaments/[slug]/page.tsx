import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AchievementBadges } from "@/components/achievement-badges";
import { FormMessage, primaryButtonClass, secondaryButtonClass } from "@/components/forms/fields";
import { prisma } from "@/lib/db";
import { formatDay } from "@/lib/format-date";
import { can } from "@/lib/roles";
import { getCurrentUser } from "@/lib/session";
import { withdrawRegistration } from "@/lib/tournament-actions";
import { canRegister, guildRequirement, isPublic } from "@/lib/tournaments";
import { getDictionary, siteVars } from "@/i18n/server";
import { format } from "@/i18n/locale";

async function loadTournament(slug: string) {
  return prisma.tournament.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      rulesUrl: true,
      startsOn: true,
      matchDeadlineOn: true,
      status: true,
      registrationOpen: true,
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
  const open = canRegister(tournament);

  let guild: ReturnType<typeof guildRequirement> = "ok";
  if (user && open && !registered) {
    const stored = await prisma.user.findUnique({ where: { id: user.id }, select: { guildMember: true } });
    guild = guildRequirement(process.env.DISCORD_GUILD_ID?.trim(), stored?.guildMember ?? null);
  }
  const inviteUrl = process.env.DISCORD_GUILD_INVITE_URL?.trim();

  const status = typeof query.status === "string" ? query.status : "";
  const statusMessage =
    status === "registered" ? t.registered : status === "unregistered" ? t.unregistered : status === "not_open" ? t.notOpen : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <p>
        <Link href="/tournaments" className="inline-flex min-h-11 items-center text-sm text-muted hover:text-text">
          ← {t.title}
        </Link>
      </p>
      <h1 className="text-3xl font-bold text-wood-light">{tournament.name}</h1>
      <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
        <span>{t.status[tournament.status]}</span>
        <span className={tournament.registrationOpen ? "text-wood-light" : undefined}>
          {tournament.registrationOpen ? t.registrationOpen : t.registrationClosed}
        </span>
      </p>

      {statusMessage ? (
        <div className="mt-6">
          <FormMessage tone={status === "not_open" ? "error" : "ok"} message={statusMessage} />
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
        {!user ? (
          open ? (
            <div className="flex flex-wrap items-center gap-3">
              <p>{t.signInToRegister}</p>
              <Link href={`/login?next=${encodeURIComponent(`/tournaments/${slug}/register`)}`} className={primaryButtonClass + " inline-flex items-center"}>
                {dict.auth.signIn}
              </Link>
            </div>
          ) : (
            <p className="text-muted">{t.registrationClosed}</p>
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
          <p className="text-muted">{t.registrationClosed}</p>
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
      </section>

      <section aria-labelledby="inscritos" className="mt-8">
        <h2 id="inscritos" className="text-xl font-semibold">
          {format(t.players, { count: players.length })}
        </h2>
        {players.length === 0 ? (
          <p className="mt-3 text-muted">{t.noPlayers}</p>
        ) : (
          <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {players.map((player) => (
              <li key={player.id} className="flex min-w-0 items-center gap-3 rounded-md border border-border bg-surface p-3">
                {player.image ? (
                  <Image src={player.image} alt="" width={32} height={32} className="size-8 shrink-0 rounded-full" />
                ) : null}
                <span className="min-w-0 truncate">{player.name}</span>
                <AchievementBadges achievements={player.achievements} dict={dict} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
