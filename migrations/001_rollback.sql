-- 001_rollback.sql — Revierte 001_scheduler_columns.sql.
-- OJO: borra los datos de notificación del scheduler (estado/sellos/aviso_min).
-- No afecta las columnas del agente (titulo, fecha_hora, notificado, etc.).
--
-- Aplicar:  psql "$DATABASE_URL" -f migrations/001_rollback.sql

BEGIN;

ALTER TABLE eventos DROP CONSTRAINT IF EXISTS chk_eventos_aviso_min;

DROP INDEX IF EXISTS idx_eventos_pendientes;

ALTER TABLE eventos DROP COLUMN IF EXISTS notif_enviado_at;
ALTER TABLE eventos DROP COLUMN IF EXISTS notif_intento_at;
ALTER TABLE eventos DROP COLUMN IF EXISTS notif_estado;
ALTER TABLE eventos DROP COLUMN IF EXISTS aviso_min;

COMMIT;
