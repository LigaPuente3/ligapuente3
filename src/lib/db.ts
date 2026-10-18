import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { attachDatabasePool } from "@vercel/functions";
import { Pool } from "pg";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * Conexión a PostgreSQL (Supabase) por el pooler en modo transacción (puerto 6543).
 * Pool pequeño por instancia: con Vercel Fluid una instancia atiende varias
 * peticiones a la vez, y el pooler de Supabase reparte las conexiones reales.
 * No se conecta hasta la primera consulta, así que el build no necesita base de datos.
 */
function createClient() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 3,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 5_000,
  });
  // En Vercel, cierra las conexiones ociosas antes de que la función se suspenda.
  attachDatabasePool(pool);
  return new PrismaClient({ adapter: new PrismaPg(pool) });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
