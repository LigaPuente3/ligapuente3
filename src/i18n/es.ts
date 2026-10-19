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
    tournaments: "Torneos",
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
    profile: "Perfil",
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
  roles: { PLAYER: "Jugador", MODERATOR: "Moderador", ADMIN: "Administrador" },
  stage: {
    badge: "Alfa",
    notice: "Versión alfa: la web está en pruebas y puede cambiar o tener fallos. Los datos podrían reiniciarse.",
  },
  profile: {
    title: "Tu perfil",
    discordId: "ID de Discord",
    role: "Rol",
    memberSince: "Cuenta creada",
    deleteTitle: "Borrar mi cuenta",
    deleteBody:
      "Se borrarán tu cuenta y tus datos personales de {site}. Si vuelves a entrar con Discord, se creará una cuenta nueva. Esta acción no se puede deshacer.",
    deleteConfirm: "Entiendo que se borrará mi cuenta y no se puede deshacer.",
    deleteButton: "Borrar mi cuenta",
    deleteError: "No se ha podido borrar la cuenta. Inténtalo de nuevo o escribe a {contact}.",
    deleted: "Tu cuenta se ha borrado.",
    registrations: "Tus inscripciones",
    noRegistrations: "No estás inscrito en ningún torneo.",
  },
  admin: {
    title: "Administración",
    intro: "Panel de administración de {site}. Lo ven los moderadores y los administradores.",
    usersTitle: "Usuarios",
    stats: { total: "Total", PLAYER: "Jugadores", MODERATOR: "Moderadores", ADMIN: "Administradores" },
    statsError: "No se han podido cargar los datos. Inténtalo más tarde.",
    comingSoonTitle: "Próximamente",
    comingSoonBody: "Torneos, inscripciones, divisiones, liguilla y eliminatorias.",
    docsLink: "Documentación de administración",
    usersLink: "Gestionar usuarios y roles",
    tournamentsLink: "Gestionar torneos e inscripciones",
    achievementsLink: "Asignar «Liga Puente 3» a los jugadores",
    leagueWins: {
      title: "Ganadores de la Liga Puente 3",
      intro:
        "Los jugadores no pueden marcarse este logro. Indica aquí cuántas ediciones ha ganado cada uno (por ejemplo, las anteriores a esta web). Las que se jueguen aquí se sumarán solas al terminar.",
      label: "Ediciones ganadas por {name}",
      saved: "Guardado.",
      invalid: "Usa un número entero del 0 al 99.",
      failed: "No se ha podido guardar. Inténtalo de nuevo.",
    },
    users: {
      title: "Usuarios y roles",
      intro: "Los administradores pueden nombrar moderadores y otros administradores. Los cambios tardan hasta 5 minutos en aplicarse.",
      search: "Buscar por nombre o ID de Discord",
      searchButton: "Buscar",
      empty: "No hay usuarios que coincidan.",
      name: "Usuario",
      role: "Rol",
      save: "Guardar",
      you: "Tú",
      configAdmin: "Administrador por configuración",
      previous: "Anterior",
      next: "Siguiente",
      page: "Página {page} de {pages}",
      saved: "Rol actualizado.",
      errors: {
        not_allowed: "No tienes permiso para cambiar roles.",
        self: "No puedes cambiar tu propio rol.",
        config_admin: "Este administrador está definido en la configuración (ADMIN_DISCORD_IDS) y no se cambia desde aquí.",
        invalid_role: "Rol no válido.",
        not_found: "El usuario no existe.",
        failed: "No se ha podido guardar. Inténtalo de nuevo.",
      },
    },
    docs: {
      title: "Documentación de administración",
      intro: "Cómo se gestiona {site}. Versión alfa: los roles y sus permisos pueden cambiar.",
      sections: [
        {
          title: "Roles",
          paragraphs: [
            "Hay tres roles. Al entrar por primera vez, toda cuenta es jugador.",
            "Jugador: se inscribe en torneos, juega sus partidas y puede borrar su cuenta desde su perfil.",
            "Moderador: lo mismo que un jugador y, además, entra en este panel y ayuda con las partidas: emparejamientos y cruces, e introducir, confirmar y corregir resultados; también asigna el logro «Liga Puente 3». No crea torneos, no asigna divisiones y no cambia roles.",
            "Administrador: lo puede hacer todo: crear y gestionar torneos y divisiones, revisar inscripciones, nombrar moderadores y administradores y todo lo que hace un moderador. Los administradores también pueden jugar.",
            "Son administradores fijos las cuentas cuyo ID de Discord está en la variable ADMIN_DISCORD_IDS de Vercel; esos no se pueden cambiar desde la web. Nadie puede cambiar su propio rol.",
          ],
        },
        {
          title: "Torneos e inscripciones",
          paragraphs: [
            "En Administración → Gestionar torneos e inscripciones se crea cada edición. Empieza en «Borrador» (solo la ven los administradores); al pasarla a «Publicado» la ve todo el mundo. La inscripción se abre y se cierra con su casilla, y puede seguir abierta con el torneo «En juego» para que entre gente en la Común.",
            "En la ficha del torneo se ven todas las inscripciones con sus respuestas, incluidas ciudad y país (solo administradores). Solo se pueden borrar los torneos en borrador.",
            "Para exigir ser miembro del servidor de Discord de la comunidad, pon su ID en la variable DISCORD_GUILD_ID de Vercel (y, si quieres, un enlace de invitación en DISCORD_GUILD_INVITE_URL). La comprobación se hace al iniciar sesión.",
          ],
        },
        {
          title: "Cómo cambiar el rol de alguien",
          paragraphs: [
            "La persona tiene que haber entrado al menos una vez con Discord. Después, en Administración → Gestionar usuarios y roles, búscala, elige el rol y pulsa Guardar. El cambio tarda hasta 5 minutos en aplicarse.",
          ],
        },
        {
          title: "Cómo obtener un ID de Discord",
          paragraphs: [
            "En Discord: Ajustes de usuario → Desarrollador (o Avanzado) → activa el Modo desarrollador. Después, haz clic en el usuario (o clic derecho) → Copiar ID de usuario.",
          ],
        },
        {
          title: "Estado del servicio",
          paragraphs: [
            "La dirección /api/health indica la región en la que corre la web (debe ser fra1, Frankfurt), la hora, la última migración aplicada y el tiempo de respuesta de la base de datos (debe ser de pocos milisegundos).",
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
            "Cada persona puede borrar su cuenta desde su perfil. Si alguien lo pide por otra vía, se borra su fila de la tabla users en el SQL Editor (sus sesiones y su cuenta de Discord vinculada se borran solas): DELETE FROM users WHERE discord_id = '…';",
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
  tournaments: {
    title: "Torneos",
    intro: "Ediciones de la liga de {community}.",
    empty: "Todavía no hay torneos publicados.",
    status: { DRAFT: "Borrador", PUBLISHED: "Publicado", IN_PROGRESS: "En juego", FINISHED: "Terminado" },
    registrationOpen: "Inscripción abierta",
    registrationClosed: "Inscripción cerrada",
    startsOn: "Empieza",
    deadline: "Plazo para jugar la liguilla",
    rules: "Bases de la competición",
    players: "Inscritos ({count})",
    noPlayers: "Aún no hay nadie inscrito.",
    register: "Inscribirme",
    editRegistration: "Editar mi inscripción",
    unregister: "Darme de baja",
    unregisterConfirm: "Confirmo que quiero darme de baja",
    youAreRegistered: "Estás inscrito en este torneo.",
    signInToRegister: "Entra con Discord para inscribirte.",
    guildNotMember:
      "Para inscribirte tienes que ser miembro del servidor de Discord de {community}. Únete al servidor, sal de la web y vuelve a entrar.",
    guildUnknown:
      "No hemos podido comprobar si eres miembro del servidor de Discord de {community}. Sal de la web y vuelve a entrar para comprobarlo.",
    joinGuild: "Unirme al servidor de Discord",
    registered: "¡Inscripción guardada!",
    unregistered: "Te has dado de baja del torneo.",
    notOpen: "La inscripción de este torneo no está abierta.",
    viewAll: "Ver todos los torneos",
    form: {
      title: "Inscripción: {name}",
      intro: "Rellena el formulario para inscribirte. Tu nombre de Discord se toma de tu cuenta.",
      previousParticipation: "¿Participaste en la edición anterior de la liga?",
      participation: {
        LAST_EDITION: "Sí",
        FIRST_TIME: "No, es mi primera vez",
        EARLIER_EDITIONS: "No, pero jugué ediciones anteriores",
      },
      firstTimeBigWin: "Si es tu primera vez: ¿has ganado un PQ, un Sector o un Regional?",
      streamingConsent:
        "¿Das permiso para que tus partidas puedan retransmitirse en el YouTube de {community} o de otros creadores, siempre que se te pregunte antes?",
      yes: "Sí",
      no: "No",
      city: "Ciudad",
      country: "País",
      locationNote: "La ciudad y el país solo los ven los administradores, para saber desde dónde se juega.",
      rulesAccepted: "He leído y acepto las bases de la competición",
      rulesLink: "Leer las bases",
      submit: "Guardar inscripción",
      cancel: "Cancelar",
      errors: {
        required: "Este campo es obligatorio.",
        too_long: "Es demasiado largo.",
        invalid: "Valor no válido.",
        form: "Revisa los campos marcados.",
      },
    },
  },
  adminTournaments: {
    title: "Torneos",
    intro: "Crea y gestiona las ediciones de la liga y revisa las inscripciones.",
    new: "Nuevo torneo",
    edit: "Editar torneo",
    empty: "Todavía no hay torneos.",
    name: "Nombre",
    description: "Descripción (opcional)",
    rulesUrl: "Enlace a las bases (https://…, opcional)",
    startsOn: "Fecha de inicio (opcional)",
    matchDeadlineOn: "Plazo para jugar la liguilla (opcional)",
    status: "Estado",
    statusHelp:
      "Borrador: solo lo ven los administradores. Publicado: visible para todos. En juego: la liguilla ha empezado. Terminado: edición cerrada.",
    registrationOpen: "Inscripción abierta",
    registrationHelp: "Se puede dejar abierta con el torneo en juego, para que la gente entre en la división Común.",
    promotions: "Ascienden por división",
    relegations: "Descienden por división",
    save: "Guardar",
    saved: "Torneo guardado.",
    publicLink: "Ver página pública",
    registrations: "Inscripciones ({count})",
    noRegistrations: "Aún no hay inscripciones.",
    columns: {
      player: "Jugador",
      previous: "Edición anterior",
      firstTimeBigWin: "PQ/Sector/Regional",
      streaming: "Retransmisión",
      location: "Ciudad y país",
      date: "Fecha",
    },
    delete: "Borrar torneo",
    deleteHint: "Solo se pueden borrar los torneos en borrador. Se borran también sus inscripciones.",
    deleteConfirm: "Confirmo que quiero borrar este torneo",
    deleted: "Torneo borrado.",
    errors: {
      required: "Este campo es obligatorio.",
      too_short: "Es demasiado corto.",
      too_long: "Es demasiado largo.",
      invalid: "Valor no válido.",
      invalid_url: "Debe ser un enlace que empiece por https://",
      form: "Revisa los campos marcados.",
      not_draft: "Solo se pueden borrar torneos en borrador.",
    },
  },
  achievements: {
    title: "Logros",
    intro:
      "Indica cuántas veces has ganado cada torneo (0 si ninguna). Se muestran junto a tu nombre en tu perfil y, más adelante, en las clasificaciones. La Liga Puente 3 🏆 no se marca aquí: se suma al ganarla en esta web o la asignan los moderadores.",
    names: { GALACTIC: "Galactic", REGIONAL: "Regional", SECTOR: "Sector", PQ: "PQ", LIGA_PUENTE3: "Liga Puente 3" },
    winsOf: "Veces que has ganado: {name}",
    save: "Guardar logros",
    saved: "Logros guardados.",
    invalid: "Usa números enteros del 0 al 99.",
    none: "Sin logros todavía.",
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
          "Al inscribirte en un torneo guardamos tus respuestas: si participaste en la edición anterior, si has ganado un PQ, Sector o Regional, si permites que se retransmitan tus partidas, tu ciudad y tu país (estos dos solo los ven los administradores) y la fecha en que aceptaste las bases.",
          "Si la liga exige ser miembro de su servidor de Discord, al entrar pedimos además permiso para comprobarlo (ámbito «guilds.members.read») y solo guardamos si eres miembro o no.",
          "Los logros que indiques en tu perfil (torneos ganados) se muestran públicamente junto a tu nombre.",
          "También guardamos los datos que generes al participar en la liga: emparejamientos y resultados.",
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
          "Puedes pedir el acceso, la rectificación, la supresión (borrado de tu cuenta), la limitación, la oposición y la portabilidad de tus datos escribiendo a {contact}. Puedes borrar tu cuenta tú mismo en cualquier momento desde tu perfil. También puedes retirar el acceso de {site} en Discord: Ajustes de usuario → Aplicaciones autorizadas.",
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
        title: "Torneos e inscripción",
        paragraphs: [
          "En «Torneos» verás las ediciones de la liga. Si la inscripción está abierta, pulsa «Inscribirme», rellena el formulario y acepta las bases. Mientras siga abierta puedes editar tu inscripción o darte de baja desde la página del torneo.",
          "Si la liga exige ser miembro del servidor de Discord de {community} y no lo eres, únete al servidor, sal de la web y vuelve a entrar.",
        ],
      },
      {
        title: "Logros",
        paragraphs: [
          "En tu perfil puedes indicar cuántas veces has ganado un Galactic, un Regional, un Sector o un PQ. Aparecen como iconos junto a tu nombre.",
          "La Liga Puente 3 🏆 no la puedes marcar tú: se suma al ganarla en esta web, y las ediciones anteriores las asignan los moderadores.",
        ],
      },
      {
        title: "Tu perfil y cómo borrar tu cuenta",
        paragraphs: [
          "Pulsa tu nombre en la cabecera para ver tu perfil. Al final está «Borrar mi cuenta»: marca la casilla de confirmación y pulsa el botón. Se borran tu cuenta y tus datos personales.",
        ],
      },
      {
        title: "Versión alfa",
        paragraphs: [
          "{site} está en pruebas: puede cambiar, tener fallos y sus datos podrían reiniciarse. Si ves algo raro, avisa a los organizadores.",
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
