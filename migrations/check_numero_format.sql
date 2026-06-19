-- check_numero_format.sql — Verificación previa al envío real (Hito 3).
-- El scheduler reconstruye el chatId desde `eventos.numero` con la regla:
--   numero CON '@'  -> se usa tal cual (ej. '...@lid')
--   numero SIN '@'  -> se le agrega '@c.us'
-- Antes de confiar en el envío, confirmá que todos los `numero` caen en uno de esos casos
-- (sin formatos raros). Si aparece algo inesperado, revisá antes de mandar mensajes reales.
--
-- Uso:  psql "$DATABASE_URL" -f migrations/check_numero_format.sql

SELECT
  CASE
    WHEN numero LIKE '%@c.us' THEN 'sufijo @c.us'
    WHEN numero LIKE '%@lid'  THEN 'sufijo @lid'
    WHEN numero LIKE '%@%'    THEN 'otro sufijo @...'
    WHEN numero ~ '^[0-9]+$'  THEN 'teléfono pelado (se le agrega @c.us)'
    ELSE 'INESPERADO (revisar)'
  END AS formato,
  count(*) AS cantidad
FROM eventos
GROUP BY 1
ORDER BY 2 DESC;
