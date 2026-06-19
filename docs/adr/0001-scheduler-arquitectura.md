# ADR 0001 — Arquitectura del Scheduler de recordatorios (Rimainder Etapa 2)

- **Estado:** Aceptado
- **Fecha:** 2026-06-18
- **Contexto del flujo:** decidido vía `/feature` (PM → Architect → Tech-lead).

## Contexto

Rimainder (asistente de agenda por WhatsApp) es hoy 100% reactivo: agenda y consulta, pero
no avisa solo. La Etapa 2 del roadmap es volverlo **proactivo**: un proceso que, llegada la
hora de un evento, manda el recordatorio sin que el usuario lo pida. El agente actual es un
backend Python (FastAPI) en producción en una VPS, con Postgres y OpenWA como gateway de
WhatsApp. La tabla `eventos` ya nació preparada (campo `fecha_hora` en UTC y flag
`notificado`).

## Decisiones

### D1 — Backend NestJS separado, no un script Python
El scheduler es un **servicio NestJS/TypeScript nuevo**, corriendo en paralelo al agente,
compartiendo solo la BD Postgres y la REST API de OpenWA. **Anula** la nota del
`Estado_proyecto.md` que lo planteaba como `scheduler.py`.
**Por qué:** se quería un backend robusto y desacoplado (alineado al stack del proyecto:
NestJS), no un script; y no arriesgar el agente que ya está en producción. Se puede deployar
y reiniciar solo, sin tocar el agente.

### D2 — Corre en VPS 24/7 (no best-effort local)
**Por qué:** ya hay VPS. La ventana de gracia se mantiene para cubrir deploys/cortes, no
porque dependa de "la PC encendida".

### D3 — El scheduler solo lee y marca
El único escritor semántico de la agenda sigue siendo el agente Python. El scheduler solo
actualiza estado de notificación (`notif_*`, `notificado`) y rueda `fecha_hora` en eventos
recurrentes.
**Por qué:** evita dos escritores compitiendo por la lógica de la agenda.

### D4 — Idempotencia por máquina de estados + claim atómico
Estados en la fila: `pendiente → enviando → enviado`. El tick hace un `UPDATE … RETURNING`
que selecciona y marca `enviando` en un solo statement (claim atómico), envía, y marca
`enviado`/`notificado=true` **solo tras 200/201** de OpenWA. Un paso de "liberar stuck"
recupera filas colgadas en `enviando` (crash).
**Por qué:** un recordatorio duplicado o spam es peor que la simplicidad. El claim atómico
basta para 1 instancia y deja la puerta abierta (`FOR UPDATE SKIP LOCKED`) a más sin costo.
**Riesgo aceptado:** si el proceso crashea entre "OpenWA aceptó" y "marcar enviado", puede
repetirse un aviso una vez. Aceptable para volumen personal.

### D5 — Columnas nuevas en `eventos`, no tabla aparte
Se agregan `aviso_min`, `notif_estado`, `notif_intento_at`, `notif_enviado_at` a `eventos`.
**Por qué:** el agente crea tablas con SQLAlchemy `create_all`, que **no altera tablas
existentes** → las columnas nuevas le son invisibles y seguras, y el claim es un solo UPDATE
sin JOINs. Una tabla aparte solo agregaría JOINs sin aislamiento real.
**Consecuencia:** la migración es un **ALTER SQL manual** (el agente no migra), probado antes
en una copia de la BD.

### D6 — Anticipación configurable por evento (`aviso_min`)
Momento de aviso = `fecha_hora - aviso_min`. Default 0 (a la hora exacta).
**Consecuencia:** se toca el agente Python (aditivo) para capturar "avisame X antes" en
lenguaje natural y persistir `aviso_min`.

### D7 — Texto con plantilla fija (sin LLM)
**Por qué:** cero costo, cero latencia, sin acoplar el scheduler al modelo/cuota de OpenRouter.

### D8 — Recurrencia que "rueda", ajustando al último día del mes
Al disparar/descartar un evento recurrente, se calcula la próxima `fecha_hora` desde la fecha
**original** (no desde "ahora") y se avanza hasta la primera ocurrencia futura. Días borde
(31, 29-feb) se ajustan al último día del mes; nunca se saltea una ocurrencia. Implementado
con `luxon`.

## Alternativas descartadas

- **Cola/broker (BullMQ + Redis), múltiples workers, backoff exponencial, exactly-once duro,
  tabla de auditoría de envíos.** Sobre-ingeniería para un volumen personal best-effort; el
  re-poll del minuto siguiente cubre el ~99% de los reintentos.
- **Que el scheduler cree/edite eventos.** Rompería la propiedad única de la agenda (D3).

## Consecuencias

- (+) Servicio simple, desplegable y reiniciable de forma aislada.
- (+) Cambios al agente mínimos y seguros.
- (−) Esquema compartido entre dos codebases: la migración SQL y el nombre/tipo/default de
  `aviso_min` deben mantenerse alineados a mano entre el ALTER y el modelo del agente.
- (−) Riesgo `@lid`: el scheduler reconstruye el `chatId` desde `eventos.numero` copiando
  textual la regla del agente; filas con formato raro fallan el envío (se loguea, no corrompe).

## Riesgos a vigilar en la implementación

1. Probar la migración SQL en una **copia** de la BD antes de prod.
2. Verificar el formato real de `numero` (`SELECT DISTINCT`) antes de confiar en el envío.
3. Comparar **siempre en UTC**; convertir a `TIMEZONE` solo para el texto.
