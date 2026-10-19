import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getDictionary, siteVars } from "@/i18n/server";
import { registrationState } from "@/lib/tournaments";
import { format } from "@/i18n/locale";

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const [{ dict }, params, openTournaments] = await Promise.all([
    getDictionary(),
    searchParams,
    // Lo opcional nunca rompe lo principal: si la base de datos falla, el inicio se muestra igual.
    prisma.tournament
      .findMany({
        where: { status: { in: ["PUBLISHED", "IN_PROGRESS"] } },
        orderBy: { createdAt: "desc" },
        take: 3,
        select: { slug: true, name: true, status: true, registrationOpen: true, registrationOpensAt: true, registrationClosesAt: true },
      })
      .catch(() => []),
  ]);
  const vars = siteVars(dict);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      {params.account === "deleted" ? (
        <p role="status" className="mx-auto mb-8 max-w-2xl rounded-md border border-border bg-surface-2 p-3 text-center">
          {dict.profile.deleted}
        </p>
      ) : null}
      <section className="flex flex-col items-center gap-6 text-center">
        <Image
          src="/brand/puente3-logo.png"
          alt={vars.community ?? ""}
          width={225}
          height={225}
          className="h-auto w-40 rounded-lg sm:w-48"
          priority
        />
        <h1 className="text-3xl font-bold text-wood-light sm:text-4xl">{format(dict.home.title, vars)}</h1>
        <p className="max-w-2xl text-lg text-muted">{dict.home.tagline}</p>
      </section>

      <section
        aria-labelledby="estado"
        className="mx-auto mt-10 max-w-2xl rounded-lg border border-blood-dark bg-surface-2 p-5"
      >
        <h2 id="estado" className="font-semibold text-blood">
          {dict.home.statusTitle}
        </h2>
        <p className="mt-2">{dict.home.statusBody}</p>
      </section>

      {openTournaments.length > 0 ? (
        <section aria-labelledby="torneos" className="mx-auto mt-10 max-w-2xl">
          <h2 id="torneos" className="text-2xl font-semibold">
            {dict.tournaments.title}
          </h2>
          <ul className="mt-4 flex flex-col gap-3">
            {openTournaments.map((tournament) => (
              <li key={tournament.slug}>
                <Link
                  href={`/tournaments/${tournament.slug}`}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-wood bg-surface p-4 hover:bg-surface-2"
                >
                  <span className="font-semibold text-wood-light">{tournament.name}</span>
                  <span className="text-sm text-muted">
                    {registrationState(tournament) === "open" ? dict.tournaments.registrationOpen : dict.tournaments.status[tournament.status]}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-2">
            <Link href="/tournaments" className="inline-flex min-h-11 items-center text-sm text-wood-light underline hover:text-text">
              {dict.tournaments.viewAll}
            </Link>
          </p>
        </section>
      ) : null}

      <section aria-labelledby="como-funciona" className="mt-12">
        <h2 id="como-funciona" className="text-2xl font-semibold">
          {dict.home.featuresTitle}
        </h2>
        <ul className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {dict.home.features.map((feature) => (
            <li key={feature.title} className="rounded-lg border border-border bg-surface p-5">
              <h3 className="font-semibold text-wood-light">{feature.title}</h3>
              <p className="mt-2 text-muted">{feature.body}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
