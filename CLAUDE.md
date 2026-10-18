# CLAUDE.md — reglas de trabajo de LigaPuente3

Web para gestionar la liga de la comunidad de **puente3**: entrada solo con Discord, inscripción en torneos, liguilla y eliminatorias. Mantener este archivo al día.

## Comunicación
- Responder siempre en **español**. Commits, PRs e issues también en español. La web: español por defecto e inglés (`src/i18n/es.ts` y `en.ts`, con `Dictionary = typeof es`).
- La persona que mantiene el proyecto no es experta en los paneles de GitHub, Vercel, Supabase ni Discord: **guiar paso a paso**, con la ruta exacta de menús y botones, y **esperar confirmación** antes del siguiente paso.
- **Nunca pedir que se peguen contraseñas, claves ni tokens en el chat**, y no imprimirlos.
- En la app de escritorio de Claude, el texto que va antes de la caja de pregunta final se resume y no se ve: **las instrucciones para el usuario van en el mensaje final**, completas, después de cerrar el turno (sin caja de pregunta si el mensaje lleva pasos).
- **No dejar archivos de instrucciones en el proyecto**: el proyecto debe quedar limpio.
- Cuando se abra una autenticación en el navegador, recordar comprobar que es el perfil de Edge «LigaPuente3» y la cuenta `desarrolloswu` antes de autorizar.

## Aislamiento (reglas duras)
En el equipo de desarrollo hay otros proyectos con otra cuenta de GitHub. No deben verse afectados.
1. **Nada global**: ni `git config --global`, ni el Administrador de credenciales de Windows, ni `gh auth login/logout/switch/refresh` sobre la configuración por defecto de `gh`. No instalar nada global (`npm i -g`).
2. **Git**, solo en este repositorio (`--local`): `user.name desarrolloswu`, `user.email <id>+desarrolloswu@users.noreply.github.com` y, como gestor de credenciales, el `gh` propio del proyecto:
   ```bash
   git config --local credential.https://github.com.username desarrolloswu
   git config --local --add credential.https://github.com.helper ""
   git config --local --add credential.https://github.com.helper '!GH_CONFIG_DIR="$USERPROFILE/.config/gh-ligapuente3" gh auth git-credential'
   ```
3. **GitHub CLI**: directorio propio `GH_CONFIG_DIR=%USERPROFILE%\.config\gh-ligapuente3`, definido en `.claude/settings.local.json` (clave `env`; no se sube). El inicio de sesión lo hace la persona en su terminal, **siempre con `--insecure-storage`** (para no escribir en el Administrador de credenciales):
   `gh auth login --hostname github.com --git-protocol https --web --skip-ssh-key --insecure-storage` (responder **No** a «Authenticate Git…»). Permisos necesarios: `repo`, `read:org`, `workflow`.
4. **Antes de crear un repositorio, una PR o una issue**: `gh auth status` y confirmar que la cuenta activa es `desarrolloswu`.
5. Sin CLI de Vercel ni de Supabase: se trabaja desde los paneles web y la integración de GitHub con Vercel.
6. Puerto de desarrollo **3100** (`npm run dev`). Redirección de Discord en desarrollo: `http://localhost:3100/api/auth/callback/discord`.
7. Si alguna regla no se puede cumplir, **parar y preguntar**.

## Servicios
Inventario y traspaso en [`docs/TRANSFERENCIA.md`](docs/TRANSFERENCIA.md). Resumen: GitHub `LigaPuente3/ligapuente3` (público, MIT), Vercel `ligapuente3` (Hobby, región `fra1`), Supabase `ligapuente3-dev` y `ligapuente3-prod` (Frankfurt, sin Data API, sin integración de GitHub), aplicación de Discord `LigaPuente3` (solo OAuth2, sin enlace de instalación).

## Traspasable
- **Nada personal** en el código ni en los commits (ni nombres, ni correos, ni usuarios personales, ni rutas de un equipo concreto).
- Todo lo que dependa de quien gestione la web va en **variables de entorno** (`src/lib/site.ts`, `.env.example`).
- Al añadir un servicio o una variable: actualizar `.env.example` y `docs/TRANSFERENCIA.md` (incluida la lista de claves a rotar).

## Flujo de cambios
1. **Una rama por cambio, desde `origin/main`, y una PR.** Nunca push directo a `main` (está protegida por un ruleset) y **nunca PRs apiladas**. Las PRs, en español, con qué hace, cómo se ha probado y qué no se ha podido probar. Las fusiona la persona responsable desde GitHub.
2. Antes de abrir la PR: `npm run lint` (incluye `check:grids`), `npm run typecheck`, `npm test` y `npm run build`. El CI ejecuta lo mismo.
3. **Versión** `1.0.0-beta.N` en `package.json`: sube con cada PR visible, con su entrada en `src/content/changelog.ts` (un test exige que coincidan).
4. **Ayuda (`/help`, ES y EN) y documentación de administración (`/admin/docs`) al día en la misma PR.**

## Base de datos e inicio de sesión
- Prisma 7 con `@prisma/adapter-pg` (`src/lib/db.ts`): `DATABASE_URL` = pooler en modo transacción (6543), pool pequeño (`max: 3`) y `attachDatabasePool` de Vercel. `DIRECT_URL` = pooler en modo sesión (5432), solo para la CLI (`prisma.config.ts`). El cliente se genera en `src/generated/` (`postinstall`), sin necesitar conexión.
- Better Auth (`src/lib/auth.ts`) con sesiones en base de datos y **solo Discord, ámbito `identify`** (correo ficticio `<id>@discord.invalid`; los tokens de Discord no se guardan). `getCurrentUser()` va envuelto en `cache()` de React. Roles: `src/lib/roles.ts` (ADMIN por `ADMIN_DISCORD_IDS` o columna `role`).
- Las previews de Vercel no permiten iniciar sesión todavía (Discord exige redirecciones exactas); pendiente: plugin `oAuthProxy` de Better Auth con un secreto propio.
- **Nunca ejecutar migraciones ni DDL contra producción.** Las migraciones viven en `prisma/migrations` como SQL y las aplica la persona responsable en el *SQL Editor* de Supabase, con guía. Procedimiento completo en [`docs/MIGRACIONES.md`](docs/MIGRACIONES.md) (cada migración se registra en la tabla `app_migrations`).
- Cada tabla nueva: `ALTER TABLE … ENABLE ROW LEVEL SECURITY;` y **ninguna política** (la app se conecta como `postgres`).
- `npm run dev` usa el `.env.local` del proyecto `ligapuente3-dev`. El desarrollo nunca toca producción y nunca se escribe en producción para probar.
- Misma región para todo (Frankfurt). Lo que no depende entre sí va en `Promise.all`; paginar, cachear y no leer de más.

## Código
- Next.js (App Router) + React + TypeScript + Tailwind CSS v4. Versiones fijadas exactas en `package.json`.
- **Lo opcional nunca rompe lo principal**: capturar errores de funciones auxiliares; escrituras no críticas con `after()`.
- **Lógica pura y probada** (emparejamientos, clasificaciones, desempates, cuadros) con tests de Vitest. Sin tests no se da por buena.
- **Móvil primero**: probar a **375 px y 320 px**. Toda `grid` con columnas en breakpoints necesita columna base (`grid-cols-1`); lo comprueba `npm run check:grids`. Al medir desbordes, revisar también cada contenedor con scroll u `overflow-hidden` y las ventanas emergentes abiertas.
- Tema oscuro y accesible (tokens en `src/app/globals.css`). Objetivos táctiles de al menos 44 px.
- Proyecto no oficial: no usar «Star Wars», «Lucasfilm» ni sus logos en nombres, dominios ni marca.
