-- Migración 0006: documentación privada del proyecto (en la base de datos, no en el
-- repositorio público), acceso a ella por usuario y colección de cada torneo.
-- Aplicar a mano en el SQL Editor de Supabase: primero en ligapuente3-dev y,
-- cuando esté probado, en ligapuente3-prod (antes de fusionar la PR).

BEGIN;

ALTER TABLE "users" ADD COLUMN "project_docs_access" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "tournaments" ADD COLUMN "collection_code" TEXT,
ADD COLUMN "collection_name" TEXT;

CREATE TABLE "project_docs" (
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by_id" TEXT,

    CONSTRAINT "project_docs_pkey" PRIMARY KEY ("slug")
);

-- Row Level Security activada y SIN políticas (la app se conecta como postgres).
ALTER TABLE "project_docs" ENABLE ROW LEVEL SECURITY;

INSERT INTO "app_migrations" ("name") VALUES ('0006_docs_coleccion');

COMMIT;
