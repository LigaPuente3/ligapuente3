import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FormMessage, inputClass } from "@/components/forms/fields";
import type { Prisma } from "@/generated/prisma/client";
import { achievementIcons } from "@/lib/achievements";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/session";
import { setLeagueWins } from "@/lib/user-actions";
import { getDictionary } from "@/i18n/server";
import { format } from "@/i18n/locale";

const PAGE_SIZE = 25;

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getDictionary();
  return { title: dict.admin.leagueWins.title, robots: { index: false } };
}

function firstParam(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}

export default async function AdminAchievementsPage({ searchParams }: PageProps<"/admin/achievements">) {
  await requirePermission("achievements.manage", "/admin/achievements");
  const [{ dict }, params] = await Promise.all([getDictionary(), searchParams]);
  const t = dict.admin.leagueWins;
  const u = dict.admin.users;

  const q = firstParam(params.q).trim().slice(0, 100);
  const page = Math.max(1, Number.parseInt(firstParam(params.page), 10) || 1);
  const status = firstParam(params.status);

  const where: Prisma.UserWhereInput = q
    ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { discordId: q }] }
    : {};
  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { name: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        name: true,
        image: true,
        achievements: { where: { type: "LIGA_PUENTE3" }, select: { count: true } },
      },
    }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const pageLink = (n: number) => `/admin/achievements?${new URLSearchParams({ ...(q ? { q } : {}), page: String(n) })}`;
  const message = status === "saved" ? t.saved : status === "invalid" ? t.invalid : status === "failed" ? t.failed : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <p>
        <Link href="/admin" className="inline-flex min-h-11 items-center text-sm text-muted hover:text-text">
          ← {dict.admin.title}
        </Link>
      </p>
      <h1 className="text-3xl font-bold text-wood-light">
        <span aria-hidden="true">{achievementIcons.LIGA_PUENTE3} </span>
        {t.title}
      </h1>
      <p className="mt-3 text-muted">{t.intro}</p>

      {message ? (
        <div className="mt-6">
          <FormMessage tone={status === "saved" ? "ok" : "error"} message={message} />
        </div>
      ) : null}

      <form action="/admin/achievements" className="mt-6 flex flex-wrap gap-2">
        <label htmlFor="q" className="sr-only">
          {u.search}
        </label>
        <input id="q" name="q" defaultValue={q} placeholder={u.search} className={`${inputClass} min-w-0 flex-1`} />
        <button type="submit" className="min-h-11 rounded-md bg-wood px-4 text-sm font-semibold text-bg hover:bg-wood-light">
          {u.searchButton}
        </button>
      </form>

      {users.length === 0 ? (
        <p className="mt-6 text-muted">{u.empty}</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {users.map((user) => (
            <li key={user.id} className="rounded-lg border border-border bg-surface p-4">
              <form action={setLeagueWins} className="flex flex-wrap items-center justify-between gap-3">
                <input type="hidden" name="userId" value={user.id} />
                <input type="hidden" name="q" value={q} />
                <input type="hidden" name="page" value={page} />
                <div className="flex min-w-0 items-center gap-3">
                  {user.image ? (
                    <Image src={user.image} alt="" width={32} height={32} className="size-8 shrink-0 rounded-full" />
                  ) : null}
                  <label htmlFor={`count-${user.id}`} className="min-w-0 truncate font-semibold">
                    {user.name}
                    <span className="sr-only"> — {format(t.label, { name: user.name })}</span>
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <span aria-hidden="true">{achievementIcons.LIGA_PUENTE3}</span>
                  <input
                    id={`count-${user.id}`}
                    name="count"
                    type="number"
                    min={0}
                    max={99}
                    inputMode="numeric"
                    defaultValue={user.achievements[0]?.count ?? 0}
                    className={`${inputClass} w-20 text-center`}
                  />
                  <button type="submit" className="min-h-11 rounded-md border border-border px-3 text-sm hover:border-wood hover:text-text">
                    {u.save}
                  </button>
                </div>
              </form>
            </li>
          ))}
        </ul>
      )}

      {pages > 1 ? (
        <nav aria-label={format(u.page, { page, pages })} className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
          {page > 1 ? (
            <Link href={pageLink(page - 1)} className="inline-flex min-h-11 items-center text-wood-light hover:text-text">
              ← {u.previous}
            </Link>
          ) : (
            <span />
          )}
          <span className="text-muted">{format(u.page, { page, pages })}</span>
          {page < pages ? (
            <Link href={pageLink(page + 1)} className="inline-flex min-h-11 items-center text-wood-light hover:text-text">
              {u.next} →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </div>
  );
}
