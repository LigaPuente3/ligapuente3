import type { Locale } from "@/i18n/locale";

export type ChangelogEntry = {
  version: string;
  /** Fecha en formato AAAA-MM-DD. */
  date: string;
  changes: Record<Locale, string[]>;
};

/**
 * Historial de cambios visible en /changelog. La entrada más reciente va primero
 * y su versión debe coincidir con la de package.json (lo comprueba un test).
 */
export const changelog: ChangelogEntry[] = [
  {
    version: "1.0.0-beta.1",
    date: "2026-10-18",
    changes: {
      es: [
        "Primera versión de la web: inicio, ayuda, novedades, privacidad y términos.",
        "Disponible en español e inglés, con selector de idioma.",
        "Diseño oscuro adaptado a móvil.",
      ],
      en: [
        "First version of the site: home, help, what's new, privacy and terms.",
        "Available in Spanish and English, with a language selector.",
        "Dark, mobile-friendly design.",
      ],
    },
  },
];
