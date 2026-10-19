import type { Metadata } from "next";
import Link from "next/link";
import { FormMessage, primaryButtonClass } from "@/components/forms/fields";
import { prisma } from "@/lib/db";
import { formatDay } from "@/lib/format-date";
import { requirePermission } from "@/lib/session";
import { getDictionary } from "@/i18n/server";
import { format } from "@/i18n/locale";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getDictionary();
  return { title: dict.adminTournaments.title, robots: { index: false } };
}

export default async function AdminTournamentsPage({ searchParams }: PageProps<"/admin/tournaments">) {
  await requirePermission("tournaments.manage", "/admin/tournaments");
  const [{ locale, dict }, params, tournaments] = await Promise.all([
    getDictionary(),
    searchParams,
    prisma.tournament.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        name: true,
        status: true,
        registrationOpen: true,
        startsOn: true,
        _count: { select: { registrations: true } },
      },
    }),
  ]);
  const t = dict.adminTournaments;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <p>
        <Link href="/admin" className="inline-flex min-h-11 items-center text-sm text-muted hover:text-text">
          ← {dict.admin.title}
        </Link>
      </p>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-wood-light">{t.title}</h1>
        <Link href="/admin/tournaments/new" className={`${primaryButtonClass} inline-flex items-center`}>
          {t.new}
        </Link>
      </div>
      <p className="mt-3 text-muted">{t.intro}</p>
      {params.status === "deleted" ? (
        <div className="mt-6">
          <FormMessage tone="ok" message={t.deleted} />
        </div>
      ) : null}

      {tournaments.length === 0 ? (
        <p className="mt-8 text-muted">{t.empty}</p>
      ) : (
        <ul className="mt-8 flex flex-col gap-3">
          {tournaments.map((tournament) => (
            <li key={tournament.id}>
              <Link
                href={`/admin/tournaments/${tournament.id}`}
                className="block rounded-lg border border-border bg-surface p-4 hover:border-wood"
              >
                <p className="font-semibold text-wood-light">{tournament.name}</p>
                <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted">
                  <span>{dict.tournaments.status[tournament.status]}</span>
                  <span>
                    {tournament.registrationOpen ? dict.tournaments.registrationOpen : dict.tournaments.registrationClosed}
                  </span>
                  {tournament.startsOn ? <span>{formatDay(tournament.startsOn, locale)}</span> : null}
                  <span>{format(t.registrations, { count: tournament._count.registrations })}</span>
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
