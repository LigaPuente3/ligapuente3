# Migraciones de la base de datos

Regla: **nadie ejecuta migraciones ni DDL contra producción desde un equipo ni desde el código**. Cada cambio de estructura es un archivo SQL que una persona aplica a mano en el *SQL Editor* de Supabase, primero en `ligapuente3-dev` y, cuando está probado, en `ligapuente3-prod`.

## Dónde están
`prisma/migrations/NNNN_nombre/migration.sql`, numeradas en orden. Cada archivo:
- va dentro de `BEGIN; … COMMIT;` (si algo falla, no se aplica nada);
- activa `ROW LEVEL SECURITY` en cada tabla nueva, **sin políticas** (la app se conecta como `postgres`);
- termina con `INSERT INTO "app_migrations" ("name") VALUES ('NNNN_nombre');`, para saber qué hay aplicado.

## Cómo se crea una migración (desarrollo)
1. Cambiar `prisma/schema.prisma`.
2. Generar el SQL de la diferencia sin tocar ninguna base de datos:
   ```bash
   npx prisma migrate diff --from-schema <esquema anterior> --to-schema prisma/schema.prisma --script
   ```
   (el esquema anterior se obtiene con `git show origin/main:prisma/schema.prisma > %TEMP%\schema-anterior.prisma`).
3. Copiarlo a `prisma/migrations/NNNN_nombre/migration.sql` y añadir `BEGIN`/`COMMIT`, RLS y el `INSERT` en `app_migrations`.
4. Revisarlo en la PR.

## Cómo se aplica (la persona responsable)
1. Supabase → proyecto **`ligapuente3-dev`** → **SQL Editor** (icono `>_` de la barra lateral) → **New query**.
2. Pegar el contenido completo de `migration.sql` y pulsar **Run**. Debe terminar sin errores.
3. Comprobar en **Table Editor** que aparecen las tablas, y que `/api/health` en local muestra la migración en `db.lastMigration`.
4. Probar la app en local con esa base de datos.
5. Repetir los pasos 1–3 en **`ligapuente3-prod`** después de fusionar la PR (o justo antes, si el código nuevo depende de la tabla). Comprobar `https://ligapuente3.vercel.app/api/health`.

Para saber qué migraciones tiene cada base de datos: `select * from app_migrations order by name;` en el SQL Editor.

## Si algo sale mal
Al ir en una transacción, un error deja la base de datos como estaba. Si una migración aplicada causa problemas, se escribe **otra migración** que lo corrija; no se editan migraciones ya aplicadas.
