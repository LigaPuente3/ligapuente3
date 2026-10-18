import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { roles } from "@/lib/roles";
import { requireRole } from "@/lib/session";
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
  await requireRole("ADMIN", "/admin");
  const [{ dict }, stats] = await Promise.all([getDictionary(), userStats()]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-3xl font-bold text-wood-light">{dict.admin.title}</h1>
      <p className="mt-3 text-muted">{format(dict.admin.intro, siteVars(dict))}</p>

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

      <p className="mt-8">
        <Link href="/admin/docs" className="inline-flex min-h-11 items-center text-wood-light underline hover:text-text">
          {dict.admin.docsLink}
        </Link>
      </p>
    </div>
  );
}
