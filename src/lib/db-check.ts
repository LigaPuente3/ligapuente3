import "server-only";
import { prisma } from "@/lib/db";

export type DbCheck =
  | { status: "not_configured" }
  | { status: "ok"; firstQueryMs: number; queryMs: number; lastMigration: string | null }
  | { status: "error"; error: string };

const TIMEOUT_MS = 5_000;

function withTimeout<T>(promise: Promise<T>): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("timeout")), TIMEOUT_MS)),
  ]);
}

async function timed(fn: () => Promise<unknown>): Promise<number> {
  const start = performance.now();
  await withTimeout(fn());
  return Math.round(performance.now() - start);
}

/**
 * Mide el tiempo de ida y vuelta a la base de datos con `select 1`.
 * La primera consulta puede incluir abrir la conexión; la segunda es la latencia real.
 */
export async function checkDatabase(): Promise<DbCheck> {
  if (!process.env.DATABASE_URL) return { status: "not_configured" };
  try {
    const firstQueryMs = await timed(() => prisma.$queryRaw`select 1`);
    const queryMs = await timed(() => prisma.$queryRaw`select 1`);
    const last = await withTimeout(
      prisma.appMigration.findFirst({ orderBy: { name: "desc" }, select: { name: true } }),
    ).catch(() => null);
    return { status: "ok", firstQueryMs, queryMs, lastMigration: last?.name ?? null };
  } catch (error) {
    console.error("checkDatabase", error);
    return { status: "error", error: error instanceof Error && error.message === "timeout" ? "timeout" : "unreachable" };
  }
}
