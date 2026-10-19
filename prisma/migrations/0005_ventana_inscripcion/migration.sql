-- Migración 0005: ventana de inscripción de cada torneo (fecha y hora de apertura y cierre, en UTC).
-- Aplicar a mano en el SQL Editor de Supabase: primero en ligapuente3-dev y,
-- cuando esté probado, en ligapuente3-prod (antes de fusionar la PR). Ver docs/MIGRACIONES.md.

BEGIN;

ALTER TABLE "tournaments" ADD COLUMN "registration_closes_at" TIMESTAMP(3),
ADD COLUMN "registration_opens_at" TIMESTAMP(3);

-- El cierre, si lo hay, tiene que ser posterior a la apertura.
ALTER TABLE "tournaments" ADD CONSTRAINT "tournaments_registration_window_check"
  CHECK ("registration_opens_at" IS NULL OR "registration_closes_at" IS NULL OR "registration_closes_at" > "registration_opens_at");

INSERT INTO "app_migrations" ("name") VALUES ('0005_ventana_inscripcion');

COMMIT;
