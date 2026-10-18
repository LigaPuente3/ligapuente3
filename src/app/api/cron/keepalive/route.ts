import { checkDatabase } from "@/lib/db-check";

export const dynamic = "force-dynamic";

/**
 * Lo llama Vercel Cron una vez al día (vercel.json) para que Supabase no pause
 * el proyecto por inactividad. Vercel envía `Authorization: Bearer <CRON_SECRET>`.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const db = await checkDatabase();
  return Response.json({ db: db.status }, { status: db.status === "ok" ? 200 : 503 });
}
