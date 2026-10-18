import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

/**
 * Estado del servicio: región de Vercel en la que corre la función, hora y versión.
 * La comprobación de la base de datos (tiempo de ida y vuelta de `select 1`) se
 * añade cuando la app se conecte a Supabase.
 */
export function GET() {
  return Response.json(
    {
      status: "ok",
      version: site.version,
      region: process.env.VERCEL_REGION ?? "local",
      time: new Date().toISOString(),
      db: { status: "not_configured" },
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
