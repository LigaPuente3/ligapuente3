import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { can, roles, type Action } from "@/lib/roles";
import { requirePermission } from "@/lib/session";
import { getDictionary, siteVars } from "@/i18n/server";
import { format } from "@/i18n/locale";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getDictionary();
  return { title: dict.admin.title, robots: { index: false } };
}

/** Recuento de usuarios por rol guardado. Si falla, la página se muestra igualmente. */
async function userStats() {
  try {
    const [total, byRole] = await Promise.all([
      prisma.user.count(),
      prisma.user.groupBy({ by: ["role"], _count: { _all: true } }),
    ]);
    const counts = Object.fromEntries(roles.map((role) => [role, 0])) as Record<(typeof roles)[number], number>;
    for (const row of byRole) counts[row.role] = row._count._all;
    return { total, counts };
  } catch (error) {
    console.error("admin userStats", error);
    return null;
  }
}

export default async function AdminPage() {
  const user = await requirePermission("admin.access", "/admin");
  const [{ dict }, stats] = await Promise.all([getDictionary(), userStats()]);
  const adminActions: { href: string; label: string; icon: string; permission?: Action }[] = [
    { href: "/admin/tournaments", label: dict.admin.tournamentsLink, icon: "🗓️", permission: "tournaments.manage" },
    { href: "/admin/achievements", label: dict.admin.achievementsLink, icon: "🏆", permission: "achievements.manage" },
    { href: "/admin/users", label: dict.admin.usersLink, icon: "👥", permission: "users.manage" },
    { href: "/admin/docs", label: dict.admin.docsLink, icon: "📖" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl font-bold text-wood-light">{dict.admin.title}</h1>
      <p className="mt-3 text-muted">{format(dict.admin.intro, siteVars(dict))}</p>

      <nav aria-label={dict.admin.title} className="mt-6">
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {adminActions
            .filter((item) => !item.permission || can(user.role, item.permission))
            .map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex min-h-14 items-center gap-3 rounded-lg border border-wood bg-surface px-4 py-3 font-semibold text-wood-light hover:bg-wood hover:text-bg"
                >
                  <span aria-hidden="true" className="text-xl">
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              </li>
            ))}
        </ul>
      </nav>

      <section aria-labelledby="usuarios" className="mt-8">
        <h2 id="usuarios" className="text-xl font-semibold">
          {dict.admin.usersTitle}
        </h2>
        {stats ? (
          <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg border border-border bg-surface p-4">
              <dt className="text-sm text-muted">{dict.admin.stats.total}</dt>
              <dd className="mt-1 text-2xl font-bold">{stats.total}</dd>
            </div>
            {roles.map((role) => (
              <div key={role} className="rounded-lg border border-border bg-surface p-4">
                <dt className="text-sm text-muted">{dict.admin.stats[role]}</dt>
                <dd className="mt-1 text-2xl font-bold">{stats.counts[role]}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p role="alert" className="mt-4 text-blood">
            {dict.admin.statsError}
          </p>
        )}
      </section>

      <section aria-labelledby="proximamente" className="mt-8 rounded-lg border border-border bg-surface-2 p-5">
        <h2 id="proximamente" className="font-semibold">
          {dict.admin.comingSoonTitle}
        </h2>
        <p className="mt-2 text-muted">{dict.admin.comingSoonBody}</p>
      </section>

    </div>
  );
}
