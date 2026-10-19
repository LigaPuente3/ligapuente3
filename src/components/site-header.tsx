import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";
import type { CurrentUser } from "@/lib/session";
import type { Dictionary } from "@/i18n/es";
import type { Locale } from "@/i18n/locale";
import { LanguageSwitcher } from "./language-switcher";
import { UserMenu } from "./user-menu";

export function SiteHeader({ locale, dict, user }: { locale: Locale; dict: Dictionary; user: CurrentUser | null }) {
  const links = [
    { href: "/", label: dict.nav.home },
    { href: "/help", label: dict.nav.help },
    { href: "/changelog", label: dict.nav.changelog },
  ];

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
        <Link href="/" className="flex min-w-0 items-center gap-2 font-bold text-wood-light">
          <Image src="/brand/puente3-logo.png" alt="" width={40} height={40} className="size-10 shrink-0 rounded" priority />
          <span className="truncate text-lg">{site.name}</span>
          <span className="shrink-0 rounded border border-blood px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-blood">
            {dict.stage.badge}
          </span>
        </Link>
        <div className="sm:order-last">
          <LanguageSwitcher locale={locale} dict={dict} />
        </div>
        <div className="flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-2 sm:ml-auto sm:w-auto">
          <nav aria-label={dict.nav.label}>
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="inline-flex min-h-11 items-center text-muted hover:text-text">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <UserMenu user={user} dict={dict} />
        </div>
      </div>
    </header>
  );
}
