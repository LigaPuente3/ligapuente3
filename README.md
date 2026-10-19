# LigaPuente3

Web para gestionar la liga de la comunidad de **puente3**: los jugadores entran con Discord, se inscriben en un torneo y compiten en una liguilla seguida de eliminatorias.

> En construcción (fase 0: fundamentos). Proyecto de la comunidad, no oficial ni afiliado a los titulares del juego.

## Tecnología

Next.js (App Router), React, TypeScript, Tailwind CSS v4 y Vitest. Desplegada en Vercel (funciones en Frankfurt, `fra1`). Base de datos PostgreSQL en Supabase (Frankfurt) e inicio de sesión con Discord, en preparación.

## Desarrollo local

Requisitos: Node.js 24.

```bash
npm install
cp .env.example .env.local   # y rellenar los valores de desarrollo
npm run dev                  # http://localhost:3100
```

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo en el puerto 3100 |
| `npm run lint` | ESLint y comprobación de rejillas (`check:grids`) |
| `npm run typecheck` | Comprobación de tipos |
| `npm test` | Tests (Vitest) |
| `npm run build` | Build de producción |

Las reglas de trabajo están en [`CLAUDE.md`](CLAUDE.md) y las de la liga en [`docs/LIGA.md`](docs/LIGA.md). La documentación técnica (servicios y traspaso) es privada y está dentro de la web, solo para sus responsables.

## Licencia

El código se publica bajo la licencia [MIT](LICENSE). El nombre y el logo de puente3 (`public/brand/`) son de puente3, se usan con su permiso y **no** están incluidos en esa licencia.
