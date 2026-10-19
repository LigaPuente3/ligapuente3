import type { Metadata } from "next";
import Image from "next/image";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { deleteMyAccount } from "@/lib/user-actions";
import { getDictionary, siteVars } from "@/i18n/server";
import { format } from "@/i18n/locale";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getDictionary();
  return { title: dict.profile.title, robots: { index: false } };
}

export default async function ProfilePage({ searchParams }: PageProps<"/profile">) {
  const user = await requireUser("/profile");
  const [{ locale, dict }, params, stored] = await Promise.all([
    getDictionary(),
    searchParams,
    prisma.user.findUnique({ where: { id: user.id }, select: { createdAt: true } }).catch(() => null),
  ]);
  const vars = siteVars(dict);
  const t = dict.profile;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-3xl font-bold text-wood-light">{t.title}</h1>

      <section className="mt-6 flex items-center gap-4 rounded-lg border border-border bg-surface p-5">
        {user.image ? (
          <Image src={user.image} alt="" width={64} height={64} className="size-16 shrink-0 rounded-full" />
        ) : null}
        <dl className="min-w-0 text-sm">
          <dt className="sr-only">{dict.admin.users.name}</dt>
          <dd className="truncate text-lg font-semibold">{user.name}</dd>
          <div className="mt-1 flex flex-wrap gap-x-2">
            <dt className="text-muted">{t.discordId}:</dt>
            <dd className="break-all">{user.discordId}</dd>
          </div>
          <div className="flex flex-wrap gap-x-2">
            <dt className="text-muted">{t.role}:</dt>
            <dd>{dict.roles[user.role]}</dd>
          </div>
          {stored ? (
            <div className="flex flex-wrap gap-x-2">
              <dt className="text-muted">{t.memberSince}:</dt>
              <dd>
                <time dateTime={stored.createdAt.toISOString()}>
                  {stored.createdAt.toLocaleDateString(locale === "es" ? "es-ES" : "en-GB", { timeZone: "Europe/Madrid" })}
                </time>
              </dd>
            </div>
          ) : null}
        </dl>
      </section>

      <section aria-labelledby="borrar" className="mt-10 rounded-lg border border-blood-dark bg-surface-2 p-5">
        <h2 id="borrar" className="text-xl font-semibold text-blood">
          {t.deleteTitle}
        </h2>
        <p className="mt-2">{format(t.deleteBody, vars)}</p>
        {params.error ? (
          <p role="alert" className="mt-3 text-sm text-blood">
            {format(t.deleteError, vars)}
          </p>
        ) : null}
        <form action={deleteMyAccount} className="mt-4 flex flex-col gap-4">
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" name="confirm" value="yes" required className="mt-0.5 size-5 shrink-0 accent-blood" />
            <span>{t.deleteConfirm}</span>
          </label>
          <button
            type="submit"
            className="min-h-11 self-start rounded-md bg-blood-dark px-4 font-semibold text-text hover:bg-blood"
          >
            {t.deleteButton}
          </button>
        </form>
      </section>
    </div>
  );
}
