-- 001_scheduler_columns.sql
-- Agrega a la tabla `eventos` (creada por el agente Python) las columnas que necesita
-- el scheduler. Es ADITIVO e idempotente: no toca nada de lo existente.
--
-- IMPORTANTE: el agente NO migra (usa SQLAlchemy create_all, que no altera tablas
-- existentes). Esta migración se corre A MANO, UNA vez, y SIEMPRE probada antes en una
-- copia/dump de la base de producción.
--
-- Aplicar:  psql "$DATABASE_URL" -f migrations/001_scheduler_columns.sql

BEGIN;

-- Anticipación del aviso, en minutos (0 = al momento exacto del evento).
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS aviso_min integer NOT NULL DEFAULT 0;

-- Máquina de estados del envío (privada del scheduler; el agente no la conoce).
-- Valores: 'pendiente' | 'enviando' | 'enviado' | 'descartado'.
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS notif_estado varchar(12) NOT NULL DEFAULT 'pendiente';

-- Sello (UTC) del claim 'enviando': permite recuperar filas colgadas por un crash.
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS notif_intento_at timestamp NULL;

-- Sello (UTC) de la confirmación de envío.
ALTER TABLE eventos ADD COLUMN IF NOT EXISTS notif_enviado_at timestamp NULL;

-- Índice parcial: el poll de cada minuto solo mira los pendientes, ordenados por fecha.
CREATE INDEX IF NOT EXISTS idx_eventos_pendientes
  ON eventos (fecha_hora)
  WHERE notificado = false AND notif_estado = 'pendiente';

-- Defensa a nivel BD: aviso_min acotado a [0, 30 días]. (Postgres no soporta IF NOT EXISTS
-- en ADD CONSTRAINT, así que lo guardamos en un bloque idempotente.)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_eventos_aviso_min'
  ) THEN
    ALTER TABLE eventos
      ADD CONSTRAINT chk_eventos_aviso_min CHECK (aviso_min >= 0 AND aviso_min <= 43200);
  END IF;
END $$;

COMMIT;
