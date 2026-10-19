import type { Metadata } from "next";
import Link from "next/link";
import { FormMessage, inputClass, primaryButtonClass, secondaryButtonClass } from "@/components/forms/fields";
import { Markdown } from "@/components/markdown";
import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/format-date";
import { requireProjectDocs } from "@/lib/project-docs";
import { deleteProjectDoc, saveProjectDoc } from "@/lib/project-docs-actions";
import { getDictionary } from "@/i18n/server";
import { format } from "@/i18n/locale";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getDictionary();
  return { title: dict.projectDocs.title, robots: { index: false } };
}

function param(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}

export default async function ProjectDocsPage({ searchParams }: PageProps<"/admin/project">) {
  const { access } = await requireProjectDocs("view", "/admin/project");
  const [{ locale, dict }, query, docs] = await Promise.all([
    getDictionary(),
    searchParams,
    prisma.projectDoc.findMany({ orderBy: { title: "asc" }, select: { slug: true, title: true } }),
  ]);
  const t = dict.projectDocs;
  const editSlug = access.edit ? param(query.edit) : "";
  const currentSlug = editSlug && editSlug !== "new" ? editSlug : param(query.doc) || docs[0]?.slug || "";
  const current = currentSlug
    ? await prisma.projectDoc.findUnique({ where: { slug: currentSlug } })
    : null;
  const status = param(query.status);
  const message = status === "saved" ? t.saved : status === "deleted" ? t.deleted : status === "invalid" ? t.invalid : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <p>
        <Link href="/admin" className="inline-flex min-h-11 items-center text-sm text-muted hover:text-text">
          ← {dict.admin.title}
        </Link>
      </p>
      <h1 className="text-3xl font-bold text-wood-light">{t.title}</h1>
      <p className="mt-3 text-sm text-muted">{t.intro}</p>
      {message ? (
        <div className="mt-4">
          <FormMessage tone={status === "invalid" ? "error" : "ok"} message={message} />
        </div>
      ) : null}

      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-[14rem_1fr]">
        <nav aria-label={t.documents}>
          <h2 className="mb-2 text-sm font-semibold text-muted">{t.documents}</h2>
          {docs.length === 0 ? <p className="text-sm text-muted">{t.empty}</p> : null}
          <ul className="flex flex-col gap-1">
            {docs.map((doc) => (
              <li key={doc.slug}>
                <Link
                  href={`/admin/project?doc=${doc.slug}`}
                  aria-current={doc.slug === currentSlug ? "page" : undefined}
                  className={`flex min-h-11 items-center rounded-md px-3 text-sm ${doc.slug === currentSlug ? "bg-surface-2 font-semibold text-wood-light" : "text-muted hover:text-text"}`}
                >
                  {doc.title}
                </Link>
              </li>
            ))}
          </ul>
          {access.edit ? (
            <Link href="/admin/project?edit=new" className={`${secondaryButtonClass} mt-4`}>
              + {t.newDoc}
            </Link>
          ) : null}
        </nav>

        <div className="min-w-0">
          {editSlug ? (
            <form action={saveProjectDoc} className="flex flex-col gap-4">
              <div>
                <label htmlFor="doc-slug" className="mb-1 block font-semibold">
                  {t.slug}
                </label>
                <input
                  id="doc-slug"
                  name="slug"
                  required
                  pattern="[a-z0-9-]{1,40}"
                  defaultValue={current?.slug ?? ""}
                  readOnly={Boolean(current)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="doc-title" className="mb-1 block font-semibold">
                  {t.docTitle}
                </label>
                <input id="doc-title" name="title" required maxLength={100} defaultValue={current?.title ?? ""} className={inputClass} />
              </div>
              <div>
                <label htmlFor="doc-body" className="mb-1 block font-semibold">
                  {t.body}
                </label>
                <textarea
                  id="doc-body"
                  name="body"
                  rows={24}
                  defaultValue={current?.body ?? ""}
                  aria-describedby="doc-body-help"
                  className={`${inputClass} py-2 font-mono text-sm`}
                />
                <p id="doc-body-help" className="mt-1 text-xs text-muted">
                  {t.bodyHelp}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="submit" className={primaryButtonClass}>
                  {t.save}
                </button>
                <Link href={current ? `/admin/project?doc=${current.slug}` : "/admin/project"} className={secondaryButtonClass}>
                  {t.cancel}
                </Link>
              </div>
            </form>
          ) : current ? (
            <article>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-2xl font-bold">{current.title}</h2>
                {access.edit ? (
                  <Link href={`/admin/project?edit=${current.slug}`} className={secondaryButtonClass}>
                    {t.edit}
                  </Link>
                ) : null}
              </div>
              <p className="mt-1 text-xs text-muted">{format(t.updated, { date: formatDateTime(current.updatedAt, locale) })}</p>
              <div className="mt-4">
                <Markdown text={current.body} />
              </div>
            </article>
          ) : (
            <p className="text-muted">{t.empty}</p>
          )}

          {editSlug && current && access.edit ? (
            <form action={deleteProjectDoc} className="mt-10 flex flex-col gap-2 border-t border-border pt-4">
              <input type="hidden" name="slug" value={current.slug} />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="confirm" value="yes" required className="size-5 accent-blood" />
                {t.deleteConfirm}
              </label>
              <button type="submit" className="min-h-11 self-start rounded-md border border-blood-dark px-4 text-sm hover:bg-blood-dark">
                {t.delete}
              </button>
            </form>
          ) : null}
        </div>
      </div>
    </div>
  );
}
