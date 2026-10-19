-- Migración 0004: divisiones, grupos y partidos de la liguilla.
-- Aplicar a mano en el SQL Editor de Supabase: primero en ligapuente3-dev y,
-- cuando esté probado, en ligapuente3-prod (antes de fusionar la PR). Ver docs/MIGRACIONES.md.

BEGIN;

-- CreateEnum
CREATE TYPE "DivisionTier" AS ENUM ('LEGENDARY', 'RARE', 'UNCOMMON', 'COMMON');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('PENDING', 'PLAYED', 'NOT_PLAYED');

-- AlterTable
ALTER TABLE "registrations" ADD COLUMN     "division" "DivisionTier";

-- CreateTable
CREATE TABLE "groups" (
    "id" TEXT NOT NULL,
    "tournament_id" TEXT NOT NULL,
    "division" "DivisionTier" NOT NULL,
    "number" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group_members" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "registration_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "matches" (
    "id" TEXT NOT NULL,
    "group_id" TEXT NOT NULL,
    "player_a_id" TEXT,
    "player_b_id" TEXT,
    "status" "MatchStatus" NOT NULL DEFAULT 'PENDING',
    "games_a" INTEGER,
    "games_b" INTEGER,
    "reported_by_id" TEXT,
    "reported_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "matches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "groups_tournament_id_division_number_key" ON "groups"("tournament_id", "division", "number");

-- CreateIndex
CREATE UNIQUE INDEX "group_members_registration_id_key" ON "group_members"("registration_id");

-- CreateIndex
CREATE INDEX "group_members_group_id_idx" ON "group_members"("group_id");

-- CreateIndex
CREATE INDEX "matches_player_a_id_idx" ON "matches"("player_a_id");

-- CreateIndex
CREATE INDEX "matches_player_b_id_idx" ON "matches"("player_b_id");

-- CreateIndex
CREATE UNIQUE INDEX "matches_group_id_player_a_id_player_b_id_key" ON "matches"("group_id", "player_a_id", "player_b_id");

-- AddForeignKey
ALTER TABLE "groups" ADD CONSTRAINT "groups_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group_members" ADD CONSTRAINT "group_members_registration_id_fkey" FOREIGN KEY ("registration_id") REFERENCES "registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_player_a_id_fkey" FOREIGN KEY ("player_a_id") REFERENCES "registrations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_player_b_id_fkey" FOREIGN KEY ("player_b_id") REFERENCES "registrations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "matches" ADD CONSTRAINT "matches_reported_by_id_fkey" FOREIGN KEY ("reported_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- Comprobaciones de valores válidos.
ALTER TABLE "groups" ADD CONSTRAINT "groups_number_check" CHECK ("number" >= 1);
ALTER TABLE "matches" ADD CONSTRAINT "matches_distinct_players_check" CHECK ("player_a_id" IS NULL OR "player_b_id" IS NULL OR "player_a_id" <> "player_b_id");
ALTER TABLE "matches" ADD CONSTRAINT "matches_games_check" CHECK (("games_a" IS NULL OR "games_a" BETWEEN 0 AND 2) AND ("games_b" IS NULL OR "games_b" BETWEEN 0 AND 2));
ALTER TABLE "matches" ADD CONSTRAINT "matches_played_check" CHECK ("status" <> 'PLAYED' OR ("games_a" IS NOT NULL AND "games_b" IS NOT NULL));

-- Row Level Security activada y SIN políticas (la app se conecta como postgres).
ALTER TABLE "groups" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "group_members" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "matches" ENABLE ROW LEVEL SECURITY;

INSERT INTO "app_migrations" ("name") VALUES ('0004_liguilla');

COMMIT;
