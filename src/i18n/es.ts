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
      "Ya puedes entrar con tu cuenta de Discord. Muy pronto podrás inscribirte en el primer torneo.",
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
  auth: {
    signIn: "Entrar",
    signOut: "Salir",
    signInWithDiscord: "Entrar con Discord",
    admin: "Administración",
    userMenu: "Tu cuenta",
    loginTitle: "Entrar",
    loginIntro: "Entra con tu cuenta de Discord para participar en la liga de {community}.",
    loginPrivacy:
      "Solo pedimos a Discord tu identificador, tu nombre y tu avatar (ámbito «identify»). Nunca tu correo ni tu contraseña.",
    loginError: "No se ha podido iniciar sesión con Discord. Vuelve a intentarlo.",
    alreadySignedIn: "Has entrado como {name}.",
  },
  forbidden: {
    title: "Sin permiso",
    body: "Tu cuenta no tiene permiso para ver esta página.",
    back: "Volver al inicio",
  },
  admin: {
    title: "Administración",
    intro: "Panel de administración de {site}. Solo lo ven las cuentas con rol de administrador.",
    usersTitle: "Usuarios",
    stats: { total: "Total", PLAYER: "Jugadores", ORGANIZER: "Organizadores", ADMIN: "Administradores" },
    statsError: "No se han podido cargar los datos. Inténtalo más tarde.",
    comingSoonTitle: "Próximamente",
    comingSoonBody: "Torneos, inscripciones, liguilla y eliminatorias.",
    docsLink: "Documentación de administración",
    docs: {
      title: "Documentación de administración",
      intro: "Cómo se gestiona {site}. Se mantiene al día con cada cambio.",
      sections: [
        {
          title: "Roles",
          paragraphs: [
            "Hay tres roles: jugador (PLAYER), organizador (ORGANIZER) y administrador (ADMIN). Al entrar por primera vez, toda cuenta es jugador.",
            "Son administradores las cuentas cuyo ID de Discord está en la variable de entorno ADMIN_DISCORD_IDS de Vercel (separados por comas), además de las que tengan el rol ADMIN en la base de datos.",
            "Para cambiar el rol guardado de una cuenta, de momento se hace en el SQL Editor de Supabase: UPDATE users SET role = 'ORGANIZER' WHERE discord_id = '…'; Los cambios de rol tardan hasta 5 minutos en aplicarse.",
          ],
        },
        {
          title: "Cómo obtener un ID de Discord",
          paragraphs: [
            "En Discord: Ajustes de usuario → Avanzado → activa el Modo desarrollador. Después, clic derecho (o mantener pulsado) sobre el usuario → Copiar ID de usuario.",
          ],
        },
        {
          title: "Estado del servicio",
          paragraphs: [
            "La dirección /api/health indica la región en la que corre la web (debe ser fra1, Frankfurt), la hora, la última migración aplicada y el tiempo de respuesta de la base de datos (debe ser de decenas de milisegundos).",
            "Un cron diario de Vercel consulta la base de datos para que Supabase no pause el proyecto por inactividad.",
          ],
        },
        {
          title: "Base de datos y migraciones",
          paragraphs: [
            "Los cambios de estructura de la base de datos se aplican a mano en el SQL Editor de Supabase, primero en desarrollo y después en producción, siguiendo docs/MIGRACIONES.md del repositorio.",
          ],
        },
        {
          title: "Datos personales y borrado de cuentas",
          paragraphs: [
            "Si alguien pide borrar su cuenta, se borra su fila de la tabla users (sus sesiones y su cuenta de Discord vinculada se borran solas): DELETE FROM users WHERE discord_id = '…';",
          ],
        },
        {
          title: "Traspaso",
          paragraphs: [
            "Los servicios, las variables de entorno y las claves a rotar están en docs/TRANSFERENCIA.md del repositorio.",
          ],
        },
      ],
    },
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
          "Cuando entras con Discord guardamos únicamente tu identificador de Discord, tu nombre visible y la dirección de tu avatar. No pedimos tu correo electrónico (internamente se guarda uno ficticio derivado de tu identificador) y Discord nunca nos facilita tu contraseña. No guardamos los tokens de acceso de Discord.",
          "Mientras tu sesión está abierta guardamos, por seguridad, la dirección IP y el navegador desde el que entraste; se borran al cerrar o caducar la sesión.",
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
          "Puedes pedir el acceso, la rectificación, la supresión (borrado de tu cuenta), la limitación, la oposición y la portabilidad de tus datos escribiendo a {contact}. Más adelante podrás borrar tu cuenta tú mismo desde tu perfil. También puedes retirar el acceso de {site} en Discord: Ajustes de usuario → Aplicaciones autorizadas.",
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
          "Pulsa «Entrar» en la cabecera y luego «Entrar con Discord». Discord te pedirá autorizar a {site}: solo compartimos tu identificador, tu nombre y tu avatar; nunca tu correo ni tu contraseña.",
          "Para salir, pulsa «Salir» en la cabecera. Tu nombre y tu avatar se actualizan cada vez que entras.",
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
