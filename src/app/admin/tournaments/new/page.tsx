import type { Metadata } from "next";
import Link from "next/link";
import { TournamentForm } from "@/components/forms/tournament-form";
import { requirePermission } from "@/lib/session";
import { saveTournament } from "@/lib/tournament-actions";
import { getDictionary } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { dict } = await getDictionary();
  return { title: dict.adminTournaments.new, robots: { index: false } };
}

export default async function NewTournamentPage() {
  await requirePermission("tournaments.manage", "/admin/tournaments/new");
  const { dict } = await getDictionary();
  const t = dict.adminTournaments;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <p>
        <Link href="/admin/tournaments" className="inline-flex min-h-11 items-center text-sm text-muted hover:text-text">
          ← {t.title}
        </Link>
      </p>
      <h1 className="text-3xl font-bold text-wood-light">{t.new}</h1>
      <div className="mt-8">
        <TournamentForm
          action={saveTournament.bind(null, null)}
          texts={t}
          statusNames={dict.tournaments.status}
          defaults={{ status: "DRAFT", promotions: "1", relegations: "1" }}
        />
      </div>
    </div>
  );
}
