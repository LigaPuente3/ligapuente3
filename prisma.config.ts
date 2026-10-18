import { defineConfig } from "prisma/config";

// Prisma 7 no carga .env por sí solo. Este archivo solo lo usan los comandos de
// la CLI (generate no necesita conexión). La app se conecta en src/lib/db.ts.
// DIRECT_URL: conexión directa o pooler en modo sesión (puerto 5432), para
// herramientas de migración. Nunca apuntar a producción desde un equipo local.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: {
    url: process.env.DIRECT_URL ?? "",
  },
});
