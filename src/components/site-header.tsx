import Image from "next/image";
import Link from "next/link";
import { site } from "@/lib/site";
import type { Dictionary } from "@/i18n/es";
import type { Locale } from "@/i18n/locale";
import { LanguageSwitcher } from "./language-switcher";

export function SiteHeader({ locale, dict }: { locale: Locale; dict: Dictionary }) {
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
        </Link>
        <div className="sm:order-last">
          <LanguageSwitcher locale={locale} dict={dict} />
        </div>
        <nav aria-label={dict.nav.label} className="w-full sm:ml-auto sm:w-auto">
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
      </div>
    </header>
  );
}
