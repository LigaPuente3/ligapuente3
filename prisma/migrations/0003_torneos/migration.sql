-- Migración 0003: torneos, inscripciones, logros de los jugadores y
-- pertenencia al servidor de Discord.
-- Aplicar a mano en el SQL Editor de Supabase: primero en ligapuente3-dev y,
-- cuando esté probado, en ligapuente3-prod (antes de fusionar la PR). Ver docs/MIGRACIONES.md.

BEGIN;

-- CreateEnum
CREATE TYPE "TournamentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'IN_PROGRESS', 'FINISHED');

-- CreateEnum
CREATE TYPE "PreviousParticipation" AS ENUM ('LAST_EDITION', 'FIRST_TIME', 'EARLIER_EDITIONS');

-- CreateEnum
CREATE TYPE "AchievementType" AS ENUM ('PQ', 'SECTOR', 'REGIONAL', 'GALACTIC', 'LIGA_PUENTE3');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "guild_checked_at" TIMESTAMP(3),
ADD COLUMN     "guild_member" BOOLEAN;

-- CreateTable
CREATE TABLE "tournaments" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "rules_url" TEXT,
    "starts_on" DATE,
    "match_deadline_on" DATE,
    "status" "TournamentStatus" NOT NULL DEFAULT 'DRAFT',
    "registration_open" BOOLEAN NOT NULL DEFAULT false,
    "promotions" INTEGER NOT NULL DEFAULT 1,
    "relegations" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tournaments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registrations" (
    "id" TEXT NOT NULL,
    "tournament_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "previous_participation" "PreviousParticipation" NOT NULL,
    "first_time_big_win" BOOLEAN,
    "streaming_consent" BOOLEAN NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "rules_accepted_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_achievements" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "AchievementType" NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tournaments_slug_key" ON "tournaments"("slug");

-- CreateIndex
CREATE INDEX "registrations_user_id_idx" ON "registrations"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "registrations_tournament_id_user_id_key" ON "registrations"("tournament_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_achievements_user_id_type_key" ON "user_achievements"("user_id", "type");

-- AddForeignKey
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournaments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- Comprobaciones de valores válidos.
ALTER TABLE "tournaments" ADD CONSTRAINT "tournaments_promotions_check" CHECK ("promotions" BETWEEN 0 AND 10);
ALTER TABLE "tournaments" ADD CONSTRAINT "tournaments_relegations_check" CHECK ("relegations" BETWEEN 0 AND 10);
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_count_check" CHECK ("count" BETWEEN 1 AND 99);

-- Row Level Security activada y SIN políticas (la app se conecta como postgres).
ALTER TABLE "tournaments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "registrations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_achievements" ENABLE ROW LEVEL SECURITY;

INSERT INTO "app_migrations" ("name") VALUES ('0003_torneos');

COMMIT;
