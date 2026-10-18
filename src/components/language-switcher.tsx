import { setLocaleAction } from "@/i18n/actions";
import { format, locales, type Locale } from "@/i18n/locale";
import type { Dictionary } from "@/i18n/es";

/** Selector de idioma. Es un formulario: funciona también sin JavaScript. */
export function LanguageSwitcher({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <form action={setLocaleAction} aria-label={dict.language.label} className="flex shrink-0 items-center gap-1">
      {locales.map((code) => {
        const active = code === locale;
        return (
          <button
            key={code}
            type="submit"
            name="locale"
            value={code}
            aria-pressed={active}
            aria-label={format(dict.language.switchTo, { lang: dict.language.names[code] })}
            lang={code}
            className={
              active
                ? "min-h-11 min-w-11 rounded-md bg-wood px-2 text-sm font-semibold text-bg"
                : "min-h-11 min-w-11 rounded-md border border-border px-2 text-sm font-semibold text-muted hover:border-wood hover:text-text"
            }
          >
            {code.toUpperCase()}
          </button>
        );
      })}
    </form>
  );
}
