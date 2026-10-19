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
    version: "0.6.0-alpha",
    date: "2026-10-19",
    changes: {
      es: [
        "Cada torneo tiene fecha y hora de apertura y cierre de la inscripción, y la página del torneo indica cuándo abre o hasta cuándo está abierta.",
        "Con el torneo en juego la inscripción se cierra; los moderadores pueden cerrarla antes con un botón.",
        "Los administradores pueden inscribir a mano a un jugador (altas tardías).",
        "Administración más cómoda: inscripciones a ancho completo y división para varios jugadores a la vez.",
      ],
      en: [
        "Each tournament has registration opening and closing dates and times, and the tournament page shows when it opens or until when it is open.",
        "Registration closes when the tournament is in progress; moderators can close it earlier with a button.",
        "Admins can register a player manually (late entries).",
        "Easier admin: full-width registrations and division assignment for several players at once.",
      ],
    },
  },
  {
    version: "0.5.0-alpha",
    date: "2026-10-19",
    changes: {
      es: [
        "Liguilla: divisiones (Legendaria, Rara, Infrecuente y Común) y grupos sorteados al azar.",
        "Partidos de todos contra todos al mejor de 3: cualquiera de los dos jugadores anota el resultado desde la página del torneo.",
        "Clasificación de cada grupo con desempates por juegos ganados, enfrentamiento directo y diferencia de juegos, y colores de ascenso y descenso.",
        "Los moderadores pueden corregir resultados o marcar partidos como no jugados.",
      ],
      en: [
        "Group stage: divisions (Legendary, Rare, Uncommon and Common) and randomly drawn groups.",
        "Best-of-3 round-robin matches: either player enters the result from the tournament page.",
        "Standings for each group with tiebreakers by games won, head-to-head and game difference, and promotion and relegation colours.",
        "Moderators can correct results or mark matches as not played.",
      ],
    },
  },
  {
    version: "0.4.0-alpha",
    date: "2026-10-19",
    changes: {
      es: [
        "Nueva sección «Torneos»: consulta las ediciones de la liga y sus inscritos.",
        "Inscripción en los torneos con formulario (sustituye al de Google), y opción de editarla o darte de baja.",
        "Logros en tu perfil: Galactic, Regional, Sector y PQ, con iconos junto a tu nombre. La Liga Puente 3 la asignan los moderadores.",
        "Administración de torneos: crear, publicar, abrir la inscripción y ver las inscripciones.",
        "El panel de Administración muestra sus opciones como botones.",
      ],
      en: [
        "New \"Tournaments\" section: see the league editions and who has registered.",
        "Tournament registration with a form (replaces the Google form), with options to edit it or withdraw.",
        "Achievements on your profile: Galactic, Regional, Sector and PQ, shown as icons next to your name. Liga Puente 3 is assigned by moderators.",
        "Tournament admin: create, publish, open registration and review registrations.",
        "The Admin panel shows its options as buttons.",
      ],
    },
  },
  {
    version: "0.3.0-alpha",
    date: "2026-10-19",
    changes: {
      es: [
        "La web pasa a versión alfa: aviso visible en todas las páginas.",
        "Nuevo rol de moderador, que ayuda con partidas, cruces y resultados.",
        "Los administradores pueden nombrar moderadores y administradores desde Administración.",
        "Tu perfil, con la opción de borrar tu cuenta.",
      ],
      en: [
        "The site is now an alpha version: a notice is shown on every page.",
        "New moderator role, who helps with matches, pairings and results.",
        "Admins can appoint moderators and admins from the Admin area.",
        "Your profile, with the option to delete your account.",
      ],
    },
  },
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
