# CONTEXT.md — Estado actual del proyecto

> Este archivo describe **el objetivo y el estado actual** del proyecto. Es lo que
> cambia seguido. Se mantiene con el comando `/context` y se inyecta automáticamente al
> inicio de cada sesión (hook `SessionStart`).

## 🎯 Objetivo del proyecto

**Scheduler de recordatorios proactivos de Rimainder (Etapa 2).** Un backend NestJS nuevo
que cada minuto lee la tabla `eventos` (Postgres, compartida con el agente Python) y envía
el recordatorio por WhatsApp (REST API de OpenWA) cuando llega la hora — sin que el usuario
lo pida en el momento. Convierte a Rimainder de reactivo a **proactivo**. Corre en paralelo
al agente Python; **solo lee y marca** eventos, nunca los crea/edita.

## 🧱 Stack

- **Backend:** Node.js · NestJS · TypeScript (estricto) · pnpm
- **Scheduling:** `@nestjs/schedule` (cron cada 1 min)
- **Datos:** TypeORM (`synchronize: false`) sobre **PostgreSQL** (la BD del agente)
- **HTTP saliente:** `@nestjs/axios` → OpenWA
- **Fechas:** `luxon`
- **Config:** `@nestjs/config` (valida env al arrancar)

## 🚦 Estado actual

Planificación terminada (flujo `/feature`: PM → Architect → Tech-lead). Diseño y plan de
14 tareas cerrados. **Hito 1 LISTO y verificado:** scaffold NestJS + validación de env +
`DataSource` resiliente + cron stub (cada minuto) + `GET /health`. Compila y arranca; el
smoke test mostró el cron tickeando y `/health` reportando estado (en el sandbox `db:down`
por no haber Postgres). **Próximo: Hito 2** (migración SQL + claim atómico + orquestador).

## 🧠 Decisiones recientes

- Scheduler como **backend NestJS aparte**, no un script Python (anula la nota vieja del `Estado_proyecto.md`). Ver `docs/adr/0001-scheduler-arquitectura.md`.
- Anticipación de aviso **configurable por evento** (`aviso_min`) → obliga a tocar el agente Python (aditivo).
- Idempotencia con máquina de estados `pendiente → enviando → enviado` + claim atómico `UPDATE … RETURNING`.
- Columnas nuevas en `eventos` (no tabla aparte): seguras porque el `create_all` del agente no altera tablas existentes.
- Ventana de gracia 60 min; recurrencia que "rueda" `fecha_hora` ajustando al último día del mes.
- Texto del recordatorio con **plantilla fija** (sin LLM).
- `DataSource` resiliente: el scheduler arranca aunque Postgres esté caído (reporta `db:down` en `/health` y reconecta on-demand), en vez del `TypeOrmModule.forRoot` bloqueante.

## 📌 Pendientes

Orden de entrega incremental por hitos:

- [x] **Hito 1** — el cron late: scaffold NestJS + config + `DataSource` + `/health` (T01–T03, T10 stub, T11). ✅ verificado.
- [~] **Hito 2** — ve eventos pero no envía (mock): migración SQL + entity + claim atómico + orquestador (T04, T05, T09). **Código listo, compila y unit-tests OK.** Falta tu verificación de integración contra Postgres (correr migración en copia + `seed_test_event.sql` y mirar el log mock + estados). Builder de mensaje (T07) adelantado.
- [~] **Hito 3** — envía de verdad: cliente OpenWA (T08) + toggle `SENDER_DRIVER` (openwa/mock). **Código listo, compila, 9 tests OK.** Falta tu verificación con OpenWA real (configurar `OPENWA_*`, correr `check_numero_format.sql`, enviar a tu número).
- [x] **Hito 4** — recurrencia (T06): `RecurrenciaService` (luxon, ajuste a fin de mes, salta huecos) enchufado al enviar y al descartar. ✅ 18 tests OK (incluye bordes 31/29-feb). Falta integración contra Postgres real.
- [x] **Hito 5** — el agente agenda con `aviso_min` (T12): `memory.py` (columna + param en `crear_evento`), `tools.py` (schema crear/editar + ejecutor + dict), `prompts.py` (regla "avisame X antes"→minutos). Compila. Falta probar el flujo con Ollama/OpenRouter real.
- [x] **T14** — review de seguridad (`/security`): sin críticos. Bundle de fixes aplicado (A1 clamp `aviso_min` + CHECK; M2 env condicional OPENWA\_\*; M4 regex de `numero`; A2 helmet; M1 throttle de reconexión; M3 5xx genérico). 24 tests OK. Pendientes menores (bajo): SSRF teórico, truncar `res.data` en logs, throttler en `/health`.
- [ ] **Integración pendiente (tuya):** migración 001 en copia → prod; verificar `@lid`; smoke con OpenWA real; en local SQLite del agente, borrar `rimainder.db` o hacer ALTER (create_all no agrega la columna a una tabla existente).

---

_Última actualización: 2026-06-18 — mantener con `/context`._
