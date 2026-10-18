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
    version: "1.0.0-beta.2",
    date: "2026-10-18",
    changes: {
      es: [
        "Ya puedes entrar y salir con tu cuenta de Discord (solo tu identificador, nombre y avatar).",
        "Zona de administración y su documentación, solo para administradores.",
        "Política de privacidad y ayuda actualizadas con el inicio de sesión.",
      ],
      en: [
        "You can now sign in and out with your Discord account (only your ID, name and avatar).",
        "Admin area and its documentation, for admins only.",
        "Privacy policy and help updated for signing in.",
      ],
    },
  },
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
