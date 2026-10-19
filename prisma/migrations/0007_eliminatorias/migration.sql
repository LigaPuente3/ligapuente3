-- Migración 0007: eliminatorias (cuadro por división y sus resultados).
-- Aplicar a mano en el SQL Editor de Supabase: primero en ligapuente3-dev y,
-- cuando esté probado, en ligapuente3-prod (antes de fusionar la PR).

BEGIN;

-- AlterTable
ALTER TABLE "tournaments" ADD COLUMN     "league_award_user_id" TEXT;

-- CreateTable
CREATE TABLE "brackets" (
    "id" TEXT NOT NULL,
    "tournament_id" TEXT NOT NULL,
    "division" "DivisionTier" NOT NULL,
    "definition" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "brackets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bracket_results" (
    "id" TEXT NOT NULL,
    "bracket_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "player_a_id" TEXT NOT NULL,
    "player_b_id" TEXT NOT NULL,
    "games_a" INTEGER NOT NULL,
    "games_b" INTEGER NOT NULL,
    "reported_by_id" TEXT,
    "reported_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bracket_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "brackets_tournament_id_division_key" ON "brackets"("tournament_id", "division");

-- CreateIndex
CREATE UNIQUE INDEX "bracket_results_bracket_id_code_key" ON "bracket_results"("bracket_id", "code");

-- AddForeignKey
ALTER TABLE "brackets" ADD CONSTRAINT "brackets_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bracket_results" ADD CONSTRAINT "bracket_results_bracket_id_fkey" FOREIGN KEY ("bracket_id") REFERENCES "brackets"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Comprobaciones: resultados al mejor de 3 sin empates.
ALTER TABLE "bracket_results" ADD CONSTRAINT "bracket_results_games_check"
  CHECK ("games_a" BETWEEN 0 AND 2 AND "games_b" BETWEEN 0 AND 2 AND "games_a" <> "games_b" AND GREATEST("games_a", "games_b") = 2);

-- Row Level Security activada y SIN políticas (la app se conecta como postgres).
ALTER TABLE "brackets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "bracket_results" ENABLE ROW LEVEL SECURITY;

INSERT INTO "app_migrations" ("name") VALUES ('0007_eliminatorias');

COMMIT;
