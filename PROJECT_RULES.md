# PROJECT_RULES.md — Reglas duras de este proyecto

> Reglas **innegociables y específicas** del **Scheduler de Rimainder** (Etapa 2).
> Tienen prioridad sobre las convenciones generales (`conventions/`).

## ✅ Siempre

- Responder y documentar en **español**.
- TypeScript **estricto** (`strict: true`) en todo el backend. Evitar `any` sin justificación escrita.
- Validar la configuración (env vars) **al arrancar**: si falta una variable, el proceso no levanta.
- Acceso a datos vía **TypeORM con `synchronize: false`** (la tabla `eventos` la dueña el agente Python; el scheduler NO crea ni migra esquema desde el ORM).
- Comparar fechas **siempre en UTC**. La conversión a la zona local (`TIMEZONE`) ocurre **solo** al armar el texto del mensaje.
- Derivar el `chatId` de OpenWA **copiando textual** la regla del agente: `numero.includes('@') ? numero : numero + '@c.us'`. No inventar otra regla (riesgo `@lid`).
- Marcar un evento como notificado **solo tras confirmación de envío** (HTTP 200/201) de OpenWA.

## ⛔ Nunca

- **Nunca** crear, editar ni borrar eventos desde el scheduler. Este servicio **solo lee y marca** (`notif_estado`, `notificado`, y el roll de `fecha_hora` en recurrencia). El único escritor semántico de la agenda es el agente Python.
- **Nunca** commitear secretos ni archivos `.env`.
- **Nunca** loguear la `OPENWA_API_KEY` ni connection strings (tampoco en logs de error de axios).
- **Nunca** correr la migración SQL directo en producción sin probarla antes en una copia/dump de la BD.
- **Nunca** concatenar input en SQL: queries parametrizadas siempre.
- **Nunca** romper al agente Python: los cambios en su repo son **aditivos** (solo `aviso_min`); el estado fino del scheduler (`notif_*`) es invisible para él.

## 🌿 Git y ramas

- Estrategia de ramas: **GitHub flow** (rama por feature desde `main`).
- Nombre de ramas: `feat/...`, `fix/...`, `chore/...`.
- Mensajes de commit: **Conventional Commits** (`feat:`, `fix:`, `chore:`, ...). Usar `/commit`.

## 🚀 Entornos y deploy

- Entornos: local (desarrollo) y producción (**VPS 24/7**, misma caja donde corren el agente, OpenWA y Postgres).
- Target de deploy: VPS (Docker, junto al resto del stack de Rimainder). Se define en detalle más adelante.
- Variables de entorno: en `.env` (local) y en el entorno del contenedor (VPS). Plantilla en `.env.example`.

## 🔐 Datos y seguridad

- Datos sensibles: números de teléfono y contenido de recordatorios de los usuarios (PII). Aislados por `numero`.
- El aviso de un evento va **exclusivamente** al `numero` dueño de la fila. Sin número global/hardcodeado.
- `/health` no expone secretos ni connection strings.

## 📦 Dependencias

- Gestor de paquetes: **pnpm** (lockfile `pnpm-lock.yaml`).
- Política: no agregar libs nuevas sin justificar y confirmar. Dep nueva aprobada: **`luxon`** (aritmética de calendario con bordes de mes/año + conversión UTC↔local). El resto son esenciales de NestJS.

## 🧩 Otras reglas del proyecto

- El scheduler corre **un solo proceso / una sola instancia**. No introducir colas (BullMQ/Redis), múltiples workers ni leader election salvo que el volumen lo exija.
- Idempotencia por máquina de estados (`pendiente → enviando → enviado`) + claim atómico. No reenviar un aviso dos veces (riesgo conocido aceptado: doble envío solo si el proceso crashea entre "OpenWA aceptó" y "marcar enviado").
- Ventana de gracia: avisos atrasados más de `SCHEDULER_GRACIA_MIN` (default 60) **no se envían**, se marcan notificados (anti-spam).
