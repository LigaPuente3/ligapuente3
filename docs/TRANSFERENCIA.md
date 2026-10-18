# Traspaso de LigaPuente3

Cómo pasar la web a otras personas (p. ej. los organizadores de puente3) sin tocar el código.
**Mantener al día cada vez que se añada un servicio o una variable de entorno.**

## Inventario de servicios

| Servicio | Recurso | Qué contiene | Plan |
|---|---|---|---|
| GitHub | Organización `LigaPuente3`, repositorio `ligapuente3` (público) | Código, issues, PRs, CI (GitHub Actions) y el ruleset «Proteger main» | Free |
| Vercel | Proyecto `ligapuente3` (equipo Hobby), dominio `ligapuente3.vercel.app` | Despliegues, variables de entorno, región de funciones `fra1` | Hobby (uso no comercial) |
| Supabase | Organización `LigaPuente3`: proyectos `ligapuente3-dev` y `ligapuente3-prod` (Frankfurt, `eu-central-1`) | Bases de datos PostgreSQL (Data API desactivada) | Free |
| Discord | Aplicación `LigaPuente3` en el Developer Portal (por ahora sin Team) | OAuth2 para iniciar sesión; redirecciones de dev y prod | — |

Reglas que se mantuvieron desde el principio para facilitar el traspaso:
- Cada servicio vive en su propio contenedor (organización, proyecto o aplicación) llamado `ligapuente3`.
- Supabase **sin** integración de GitHub (bloquea la transferencia de proyectos).
- Nada personal en el código ni en los commits (autor: `desarrolloswu` con correo `noreply` de GitHub).

## Cómo se traspasa cada servicio

### GitHub
- **Opción A (recomendada):** *Organización → People → Invite member* y darle rol **Owner** a la nueva persona. Cuando lo acepte, puede quitar a los antiguos propietarios.
- **Opción B:** *Repositorio → Settings → General → Danger Zone → Transfer ownership* a otra cuenta u organización. Después hay que reconectar Vercel al repositorio nuevo.
- Revisar *Settings → Rules → Rulesets* (la protección de `main` sigue con el repositorio).

### Vercel
- **Opción A:** la nueva persona crea su cuenta de Vercel, importa el repositorio desde GitHub (*Add New → Project*), fija la región `fra1` (viene en `vercel.json`) y copia las variables de entorno. Luego se borra el proyecto antiguo y se libera el dominio `ligapuente3.vercel.app` para asignarlo al nuevo (*Settings → Domains*).
- **Opción B:** *Project → Settings → General → Transfer Project* a un equipo de la nueva persona. Conserva dominio y variables.
- El plan Hobby solo permite uso no comercial y no despliega repositorios privados de organizaciones; si cambia cualquiera de las dos cosas, hace falta Pro.

### Supabase
- **Opción A:** *Organización LigaPuente3 → Team → Invite* con rol **Owner**; después, los antiguos propietarios salen de la organización.
- **Opción B:** *Project Settings → General → Transfer project* a una organización de la nueva persona (proyecto a proyecto: dev y prod).
- El plan gratuito permite 2 proyectos activos por cuenta: quien reciba los proyectos necesita tener esos huecos libres.

### Discord
- Crear un **Team** (*Developer Portal → Teams → New Team*; exige verificación en dos pasos), mover la aplicación con *General Information → Transfer App to Team* y añadir a los nuevos miembros. Para cambiar de propietario: *Team → Transfer Ownership*.
- Si cambia el dominio de producción, actualizar *OAuth2 → Redirects*.

## Variables de entorno

La lista completa y comentada está en [`.env.example`](../.env.example). Al traspasar, revisar en Vercel (y en el `.env.local` de quien desarrolle):

| Variable | Secreta | Qué cambiar al traspasar |
|---|---|---|
| `SITE_NAME`, `COMMUNITY_NAME` | No | Normalmente nada |
| `SITE_URL` | No | Si cambia el dominio |
| `CONTACT_EMAIL` | No | Correo de los nuevos responsables |
| `LEGAL_CONTROLLER_NAME` | No | Nombre del nuevo responsable del tratamiento (RGPD) |
| `REPO_URL` | No | Si se mueve el repositorio |

## Claves a rotar tras el traspaso

Todavía no hay claves secretas en uso. Se completará en la PR 2 con: contraseñas de las bases de datos de Supabase (`DATABASE_URL`, `DIRECT_URL`), `BETTER_AUTH_SECRET`, `DISCORD_CLIENT_SECRET` y `CRON_SECRET`.
