import type { Metadata } from "next";
import { changelog } from "@/content/changelog";
import { getDictionary, siteVars } from "@/i18n/server";
import { format } from "@/i18n/locale";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getDictionary();
  return { title: dict.changelog.title };
}

export default async function ChangelogPage() {
  const { locale, dict } = await getDictionary();
  const vars = siteVars(dict);

  return (
    <article className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold text-wood-light">{dict.changelog.title}</h1>
      <p className="mt-3 text-muted">{format(dict.changelog.intro, vars)}</p>
      <ol className="mt-8 flex flex-col gap-6">
        {changelog.map((entry) => (
          <li key={entry.version} className="rounded-lg border border-border bg-surface p-5">
            <h2 className="flex flex-wrap items-baseline gap-x-3 font-semibold">
              <span className="text-wood-light">{entry.version}</span>
              <time dateTime={entry.date} className="text-sm font-normal text-muted">
                {entry.date}
              </time>
            </h2>
            <ul className="mt-3 list-disc space-y-1 pl-5">
              {entry.changes[locale].map((change) => (
                <li key={change}>{change}</li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </article>
  );
}
