import { checkDatabase } from "@/lib/db-check";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

/**
 * Estado del servicio: región de Vercel en la que corre la función (debe ser fra1),
 * hora, versión y tiempo de ida y vuelta a la base de datos (`select 1`).
 * Responde 503 si la base de datos está configurada pero no responde.
 */
export async function GET() {
  const db = await checkDatabase();
  return Response.json(
    {
      status: db.status === "error" ? "degraded" : "ok",
      version: site.version,
      region: process.env.VERCEL_REGION ?? "local",
      time: new Date().toISOString(),
      db,
    },
    { status: db.status === "error" ? 503 : 200, headers: { "Cache-Control": "no-store" } },
  );
}
