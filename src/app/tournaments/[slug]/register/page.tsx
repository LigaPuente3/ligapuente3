import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { RegistrationForm } from "@/components/forms/registration-form";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { saveRegistration } from "@/lib/tournament-actions";
import { canRegister, guildRequirement } from "@/lib/tournaments";
import { getDictionary, siteVars } from "@/i18n/server";
import { format } from "@/i18n/locale";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getDictionary();
  return { title: dict.tournaments.register, robots: { index: false } };
}

export default async function RegisterPage({ params }: PageProps<"/tournaments/[slug]/register">) {
  const { slug } = await params;
  const user = await requireUser(`/tournaments/${slug}/register`);
  const [{ dict }, tournament, stored] = await Promise.all([
    getDictionary(),
    prisma.tournament.findUnique({
      where: { slug },
      select: { id: true, name: true, status: true, registrationOpen: true, registrationOpensAt: true, registrationClosesAt: true, rulesUrl: true },
    }),
    prisma.user.findUnique({ where: { id: user.id }, select: { guildMember: true } }),
  ]);
  if (!tournament || tournament.status === "DRAFT") notFound();
  if (!canRegister(tournament)) redirect(`/tournaments/${slug}?status=not_open`);
  // Si no cumple el requisito del servidor, la página del torneo explica qué hacer.
  if (guildRequirement(process.env.DISCORD_GUILD_ID?.trim(), stored?.guildMember ?? null) !== "ok") {
    redirect(`/tournaments/${slug}`);
  }

  const existing = await prisma.registration.findUnique({
    where: { tournamentId_userId: { tournamentId: tournament.id, userId: user.id } },
  });
  const defaults: Record<string, string> = existing
    ? {
        previousParticipation: existing.previousParticipation,
        firstTimeBigWin: existing.firstTimeBigWin === null ? "" : existing.firstTimeBigWin ? "yes" : "no",
        streamingConsent: existing.streamingConsent ? "yes" : "no",
        city: existing.city,
        country: existing.country,
        rulesAccepted: "yes",
      }
    : {};

  const t = dict.tournaments;
  const vars = siteVars(dict);
  const messages = {
    not_open: t.notOpen,
    not_member: format(t.guildNotMember, vars),
    unknown: format(t.guildUnknown, vars),
    form: t.form.errors.form,
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-3xl font-bold text-wood-light">{format(t.form.title, { name: tournament.name })}</h1>
      <p className="mt-3 text-muted">{t.form.intro}</p>
      <div className="mt-8">
        <RegistrationForm
          action={saveRegistration.bind(null, slug)}
          texts={t.form}
          vars={{ community: vars.community ?? "" }}
          defaults={defaults}
          rulesUrl={tournament.rulesUrl}
          cancelHref={`/tournaments/${slug}`}
          messages={messages}
        />
      </div>
    </div>
  );
}
