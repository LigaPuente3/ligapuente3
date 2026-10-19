import type { Metadata } from "next";
import Link from "next/link";
import { CollectionTag } from "@/components/collection-tag";
import { prisma } from "@/lib/db";
import { formatDay } from "@/lib/format-date";
import { getDictionary, siteVars } from "@/i18n/server";
import { registrationState } from "@/lib/tournaments";
import { format } from "@/i18n/locale";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getDictionary();
  return { title: dict.tournaments.title };
}

export default async function TournamentsPage() {
  const [{ locale, dict }, tournaments] = await Promise.all([
    getDictionary(),
    prisma.tournament.findMany({
      where: { status: { not: "DRAFT" } },
      orderBy: [{ startsOn: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
      take: 50,
      select: {
        slug: true,
        name: true,
        collectionCode: true,
        collectionName: true,
        status: true,
        registrationOpen: true, registrationOpensAt: true, registrationClosesAt: true,
        startsOn: true,
        _count: { select: { registrations: true } },
      },
    }),
  ]);
  const t = dict.tournaments;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold text-wood-light">{t.title}</h1>
      <p className="mt-3 text-muted">{format(t.intro, siteVars(dict))}</p>
      {tournaments.length === 0 ? (
        <p className="mt-8 text-muted">{t.empty}</p>
      ) : (
        <ul className="mt-8 flex flex-col gap-4">
          {tournaments.map((tournament) => (
            <li key={tournament.slug}>
              <Link
                href={`/tournaments/${tournament.slug}`}
                className="block rounded-lg border border-border bg-surface p-5 hover:border-wood"
              >
                <h2 className="flex flex-wrap items-center gap-2 text-xl font-semibold text-wood-light">
                  {tournament.name}
                  <CollectionTag code={tournament.collectionCode} name={tournament.collectionName} />
                </h2>
                <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
                  <span>{t.status[tournament.status]}</span>
                  <span className={registrationState(tournament) === "open" ? "text-wood-light" : undefined}>
                    {registrationState(tournament) === "open" ? t.registrationOpen : t.registrationClosed}
                  </span>
                  {tournament.startsOn ? (
                    <span>
                      {t.startsOn}: {formatDay(tournament.startsOn, locale)}
                    </span>
                  ) : null}
                  <span>{format(t.players, { count: tournament._count.registrations })}</span>
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
