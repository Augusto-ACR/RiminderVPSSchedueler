# Migraciones del scheduler

La tabla `eventos` la **crea y la dueña el agente Python** (SQLAlchemy `create_all`, sin
migraciones). `create_all` **no altera tablas existentes**, así que las columnas que el
scheduler necesita se agregan acá, a mano, con SQL aditivo.

## Reglas

- **Probar SIEMPRE primero en una copia/dump** de la base de producción antes de aplicar en
  prod. (`pg_dump` → restaurar en una base de prueba → correr la migración → verificar.)
- Aditivo e idempotente (`IF NOT EXISTS`): correrla dos veces no rompe nada.
- El default de `aviso_min` (0) debe coincidir con el que declara el agente en `memory.py`
  (Hito 5). Si difieren, los eventos viejos quedarían inconsistentes.

## Aplicar

```bash
psql "$DATABASE_URL" -f migrations/001_scheduler_columns.sql
```

## Revertir

```bash
psql "$DATABASE_URL" -f migrations/001_rollback.sql
```

## Qué agrega `001`

| Columna                  | Tipo                                       | Para qué                                                     |
| ------------------------ | ------------------------------------------ | ------------------------------------------------------------ |
| `aviso_min`              | `integer NOT NULL DEFAULT 0`               | Minutos de anticipación del aviso.                           |
| `notif_estado`           | `varchar(12) NOT NULL DEFAULT 'pendiente'` | Estado: `pendiente`/`enviando`/`enviado`/`descartado`.       |
| `notif_intento_at`       | `timestamp NULL`                           | Sello (UTC) del claim `enviando` (recupera stuck por crash). |
| `notif_enviado_at`       | `timestamp NULL`                           | Sello (UTC) de la confirmación de envío.                     |
| `idx_eventos_pendientes` | índice parcial                             | Hace barato el poll del minuto (solo pendientes).            |
