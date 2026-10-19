-- Migración 0002: el rol ORGANIZER pasa a llamarse MODERATOR (moderador).
-- Aplicar a mano en el SQL Editor de Supabase: primero en ligapuente3-dev y,
-- cuando esté probado, en ligapuente3-prod (antes de fusionar la PR). Ver docs/MIGRACIONES.md.

BEGIN;

-- Renombra el valor: las cuentas que fueran ORGANIZER pasan a ser MODERATOR.
ALTER TYPE "Role" RENAME VALUE 'ORGANIZER' TO 'MODERATOR';

INSERT INTO "app_migrations" ("name") VALUES ('0002_moderator');

COMMIT;
