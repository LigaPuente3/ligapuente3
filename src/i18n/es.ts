/**
 * Diccionario en español (idioma por defecto). `en.ts` debe tener la misma forma:
 * TypeScript lo comprueba con el tipo `Dictionary`.
 *
 * Marcadores disponibles en los textos: {site}, {community}, {controller},
 * {contact}, {version}, {date}, {lang}.
 */
export const es = {
  meta: {
    description: "Liga de la comunidad de {community}: inscripción con Discord, liguilla y eliminatorias.",
  },
  nav: {
    label: "Navegación principal",
    home: "Inicio",
    help: "Ayuda",
    changelog: "Novedades",
    skipToContent: "Saltar al contenido",
  },
  language: {
    label: "Idioma",
    switchTo: "Cambiar el idioma a {lang}",
    names: { es: "Español", en: "English" },
  },
  home: {
    title: "La liga de {community}",
    tagline: "Inscríbete con tu cuenta de Discord, juega la liguilla y pelea por el título en las eliminatorias.",
    statusTitle: "En construcción",
    statusBody:
      "Estamos preparando la web. Muy pronto podrás entrar con Discord e inscribirte en el primer torneo.",
    featuresTitle: "Cómo funciona",
    features: [
      {
        title: "Entra con Discord",
        body: "Sin contraseñas nuevas: solo usamos tu nombre y tu avatar de Discord.",
      },
      {
        title: "Liguilla",
        body: "Todos contra todos o por grupos. La clasificación se actualiza con cada resultado.",
      },
      {
        title: "Eliminatorias",
        body: "Los mejores de la liguilla pasan al cuadro final hasta coronar al campeón.",
      },
    ],
  },
  footer: {
    unofficial:
      "Proyecto de la comunidad, no oficial: no está afiliado ni respaldado por los titulares del juego.",
    privacy: "Privacidad",
    terms: "Términos",
    help: "Ayuda",
    version: "Versión {version}",
    sourceCode: "Código abierto (MIT)",
  },
  legal: {
    lastUpdated: "Última actualización: {date}",
    contactFallback: "los organizadores de {community}, a través de su servidor de Discord",
    controllerFallback: "los organizadores de la liga de {community}",
  },
  privacy: {
    title: "Política de privacidad",
    intro:
      "Esta página explica qué datos personales trata {site}, para qué y cómo puedes ejercer tus derechos, de acuerdo con el Reglamento General de Protección de Datos (RGPD) y la normativa española.",
    sections: [
      {
        title: "Responsable",
        paragraphs: [
          "El responsable del tratamiento es {controller}. Puedes contactar escribiendo a {contact}.",
        ],
      },
      {
        title: "Qué datos guardamos",
        paragraphs: [
          "Cuando entres con Discord guardaremos únicamente tu identificador de Discord, tu nombre visible y la dirección de tu avatar. No pedimos tu correo electrónico y Discord nunca nos facilita tu contraseña.",
          "También guardamos los datos que generes al participar en la liga: inscripciones, emparejamientos y resultados.",
        ],
      },
      {
        title: "Para qué los usamos",
        paragraphs: [
          "Para identificarte al entrar, gestionar los torneos en los que te inscribas y mostrar emparejamientos y clasificaciones. Tu nombre y tu avatar de Discord aparecen públicamente en ellos.",
        ],
      },
      {
        title: "Base legal",
        paragraphs: [
          "Tratamos tus datos porque son necesarios para prestarte el servicio que solicitas al registrarte (artículo 6.1.b del RGPD) y con tu consentimiento, que das al autorizar el acceso desde Discord.",
        ],
      },
      {
        title: "Dónde se guardan",
        paragraphs: [
          "La base de datos está alojada en Supabase, en Fráncfort (Unión Europea). La web se sirve desde Vercel, con servidores en Fráncfort; Vercel es una empresa de EE. UU. que aplica las garantías del RGPD para transferencias internacionales (cláusulas contractuales tipo y Marco de Privacidad de Datos UE-EE. UU.). El inicio de sesión lo gestiona Discord.",
        ],
      },
      {
        title: "Cookies",
        paragraphs: [
          "Solo usamos cookies técnicas: una para recordar tu idioma («lang») y, cuando inicies sesión, otra para mantener tu sesión. No usamos cookies de analítica ni de publicidad.",
        ],
      },
      {
        title: "Cuánto tiempo los conservamos",
        paragraphs: [
          "Mientras mantengas tu cuenta. Si la borras, eliminamos tus datos personales; los resultados de torneos ya disputados pueden conservarse sin datos que te identifiquen para no alterar las clasificaciones.",
        ],
      },
      {
        title: "Tus derechos y cómo borrar tu cuenta",
        paragraphs: [
          "Puedes pedir el acceso, la rectificación, la supresión (borrado de tu cuenta), la limitación, la oposición y la portabilidad de tus datos escribiendo a {contact}. Más adelante podrás borrar tu cuenta tú mismo desde tu perfil.",
          "Si consideras que no hemos atendido bien tu solicitud, puedes reclamar ante la Agencia Española de Protección de Datos (aepd.es).",
        ],
      },
      {
        title: "Cambios",
        paragraphs: [
          "Si cambiamos esta política lo indicaremos en esta página y en las novedades de la web.",
        ],
      },
    ],
  },
  terms: {
    title: "Términos de uso",
    intro: "Al usar {site} aceptas estas condiciones.",
    sections: [
      {
        title: "Qué es {site}",
        paragraphs: [
          "Una web gratuita para organizar la liga de la comunidad de {community}. Nadie paga por participar.",
          "Es un proyecto de la comunidad y no oficial: no está afiliado ni respaldado por Fantasy Flight Games, Asmodee, Disney ni Lucasfilm. Star Wars: Unlimited y sus marcas pertenecen a sus respectivos titulares.",
        ],
      },
      {
        title: "Tu cuenta",
        paragraphs: [
          "Entras con tu cuenta de Discord. Usa una sola cuenta por persona y eres responsable de lo que se haga con ella.",
        ],
      },
      {
        title: "Juego limpio y respeto",
        paragraphs: [
          "Introduce resultados veraces y trata con respeto al resto de jugadores. Los organizadores pueden corregir resultados, descalificar o bloquear cuentas que incumplan estas normas o las del torneo.",
        ],
      },
      {
        title: "Información pública",
        paragraphs: [
          "Tu nombre y tu avatar de Discord se muestran en inscripciones, emparejamientos y clasificaciones.",
        ],
      },
      {
        title: "Disponibilidad",
        paragraphs: [
          "La web se ofrece tal cual, sin garantías. Puede cambiar, tener fallos o dejar de estar disponible.",
        ],
      },
      {
        title: "Ley aplicable y contacto",
        paragraphs: [
          "Estas condiciones se rigen por la ley española. Para cualquier duda, escribe a {contact}.",
        ],
      },
    ],
  },
  help: {
    title: "Ayuda",
    intro: "Todo lo que necesitas para participar en la liga de {community}.",
    sections: [
      {
        title: "¿Qué es {site}?",
        paragraphs: [
          "La web donde te inscribes en los torneos de la liga de {community}, consultas emparejamientos y clasificaciones y sigues las eliminatorias.",
        ],
      },
      {
        title: "Cómo entrar",
        paragraphs: [
          "Muy pronto podrás entrar con tu cuenta de Discord. Solo usaremos tu identificador, tu nombre y tu avatar; nunca tu correo ni tu contraseña.",
        ],
      },
      {
        title: "Idioma",
        paragraphs: [
          "Puedes cambiar entre español e inglés con el selector de la cabecera. La web recuerda tu elección en este navegador.",
        ],
      },
      {
        title: "¿Dudas o problemas?",
        paragraphs: [
          "Escribe a los organizadores en el servidor de Discord de {community} o a {contact}.",
        ],
      },
    ],
  },
  changelog: {
    title: "Novedades",
    intro: "Historial de cambios de {site}.",
  },
  notFound: {
    title: "Página no encontrada",
    body: "La página que buscas no existe o se ha movido.",
    back: "Volver al inicio",
  },
};

export type Dictionary = typeof es;
