import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { parseAdminIds, roles } from "@/lib/roles";
import { requirePermission } from "@/lib/session";
import { changeUserRole } from "@/lib/user-actions";
import { getDictionary } from "@/i18n/server";
import { format } from "@/i18n/locale";

const PAGE_SIZE = 25;

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getDictionary();
  return { title: dict.admin.users.title, robots: { index: false } };
}

function firstParam(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}

export default async function AdminUsersPage({ searchParams }: PageProps<"/admin/users">) {
  const me = await requirePermission("users.manage", "/admin/users");
  const [{ dict }, params] = await Promise.all([getDictionary(), searchParams]);
  const t = dict.admin.users;

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
      orderBy: [{ role: "desc" }, { name: "asc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: { id: true, name: true, image: true, discordId: true, role: true },
    }),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const adminIds = parseAdminIds(process.env.ADMIN_DISCORD_IDS);
  const pageLink = (n: number) => `/admin/users?${new URLSearchParams({ ...(q ? { q } : {}), page: String(n) })}`;

  const message =
    status === "saved" ? t.saved : status in t.errors ? t.errors[status as keyof typeof t.errors] : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <p>
        <Link href="/admin" className="inline-flex min-h-11 items-center text-sm text-muted hover:text-text">
          ← {dict.admin.title}
        </Link>
      </p>
      <h1 className="text-3xl font-bold text-wood-light">{t.title}</h1>
      <p className="mt-3 text-muted">{t.intro}</p>

      {message ? (
        <p
          role="status"
          className={`mt-6 rounded-md border p-3 text-sm ${status === "saved" ? "border-border bg-surface-2" : "border-blood-dark bg-surface-2 text-text"}`}
        >
          {message}
        </p>
      ) : null}

      <form action="/admin/users" className="mt-6 flex flex-wrap gap-2">
        <label htmlFor="q" className="sr-only">
          {t.search}
        </label>
        <input
          id="q"
          name="q"
          defaultValue={q}
          placeholder={t.search}
          className="min-h-11 min-w-0 flex-1 rounded-md border border-border bg-surface px-3 text-sm placeholder:text-muted"
        />
        <button type="submit" className="min-h-11 rounded-md bg-wood px-4 text-sm font-semibold text-bg hover:bg-wood-light">
          {t.searchButton}
        </button>
      </form>

      {users.length === 0 ? (
        <p className="mt-6 text-muted">{t.empty}</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {users.map((user) => {
            const isMe = user.id === me.id;
            const isConfigAdmin = adminIds.has(user.discordId);
            const locked = isMe || isConfigAdmin;
            return (
              <li key={user.id} className="rounded-lg border border-border bg-surface p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    {user.image ? (
                      <Image src={user.image} alt="" width={40} height={40} className="size-10 shrink-0 rounded-full" />
                    ) : null}
                    <div className="min-w-0">
                      <p className="truncate font-semibold">
                        {user.name}
                        {isMe ? <span className="ml-2 text-sm font-normal text-muted">({t.you})</span> : null}
                      </p>
                      <p className="truncate text-xs text-muted">{user.discordId}</p>
                    </div>
                  </div>
                  {locked ? (
                    <p className="text-sm text-muted">
                      {isConfigAdmin ? t.configAdmin : dict.roles[user.role]}
                    </p>
                  ) : (
                    <form action={changeUserRole} className="flex flex-wrap items-center gap-2">
                      <input type="hidden" name="userId" value={user.id} />
                      <input type="hidden" name="q" value={q} />
                      <input type="hidden" name="page" value={page} />
                      <label htmlFor={`role-${user.id}`} className="sr-only">
                        {format(`${t.role}: {name}`, { name: user.name })}
                      </label>
                      <select
                        id={`role-${user.id}`}
                        name="role"
                        defaultValue={user.role}
                        className="min-h-11 rounded-md border border-border bg-surface-2 px-2 text-sm"
                      >
                        {roles.map((role) => (
                          <option key={role} value={role}>
                            {dict.roles[role]}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="min-h-11 rounded-md border border-border px-3 text-sm hover:border-wood hover:text-text"
                      >
                        {t.save}
                      </button>
                    </form>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {pages > 1 ? (
        <nav aria-label={format(t.page, { page, pages })} className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm">
          {page > 1 ? (
            <Link href={pageLink(page - 1)} className="inline-flex min-h-11 items-center text-wood-light hover:text-text">
              ← {t.previous}
            </Link>
          ) : (
            <span />
          )}
          <span className="text-muted">{format(t.page, { page, pages })}</span>
          {page < pages ? (
            <Link href={pageLink(page + 1)} className="inline-flex min-h-11 items-center text-wood-light hover:text-text">
              {t.next} →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </div>
  );
}
