-- seed_test_event.sql — Helper de DESARROLLO (no para producción).
-- Inserta un evento que vence YA, para ver al scheduler reclamarlo y (en Hito 2) loguear
-- el envío mock + dejar notif_estado='enviado'. Reemplazá el número por uno de prueba.
--
-- Uso:  psql "$DATABASE_URL" -f migrations/seed_test_event.sql

INSERT INTO eventos (numero, titulo, descripcion, fecha_hora)
VALUES ('5491100000000', 'Prueba scheduler', 'Evento de prueba', timezone('UTC', now()));

-- Para ver cómo evoluciona el estado:
--   SELECT id, titulo, fecha_hora, aviso_min, notif_estado, notificado, notif_enviado_at
--   FROM eventos ORDER BY id DESC LIMIT 5;
