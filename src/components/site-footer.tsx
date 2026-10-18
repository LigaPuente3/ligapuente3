import Link from "next/link";
import { site } from "@/lib/site";
import type { Dictionary } from "@/i18n/es";
import { format } from "@/i18n/locale";

export function SiteFooter({ dict }: { dict: Dictionary }) {
  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-6 text-sm text-muted">
        <ul className="flex flex-wrap gap-x-4 gap-y-1">
          <li>
            <Link href="/privacy" className="inline-flex min-h-11 items-center hover:text-text">
              {dict.footer.privacy}
            </Link>
          </li>
          <li>
            <Link href="/terms" className="inline-flex min-h-11 items-center hover:text-text">
              {dict.footer.terms}
            </Link>
          </li>
          <li>
            <Link href="/help" className="inline-flex min-h-11 items-center hover:text-text">
              {dict.footer.help}
            </Link>
          </li>
          <li>
            <Link href="/changelog" className="inline-flex min-h-11 items-center hover:text-text">
              {format(dict.footer.version, { version: site.version })}
            </Link>
          </li>
          {site.repoUrl ? (
            <li>
              <a href={site.repoUrl} className="inline-flex min-h-11 items-center hover:text-text" rel="noopener noreferrer">
                {dict.footer.sourceCode}
              </a>
            </li>
          ) : null}
        </ul>
        <p>{dict.footer.unofficial}</p>
      </div>
    </footer>
  );
}
