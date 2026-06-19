# 🗄️ Convenciones — Base de datos (MySQL · PostgreSQL · Supabase · Firebase)

> Guía general para datos. Elegí en `PROJECT_RULES.md` qué motor usa el proyecto y qué
> reglas específicas aplican.

## 🧭 Principios transversales

- **Una fuente de verdad por dato.** Evitar duplicación salvo desnormalización deliberada.
- **Migraciones versionadas** y reversibles. Nunca cambiar el esquema "a mano" en prod.
- **Nada de secretos en el código:** credenciales por variables de entorno.
- **Backups** y plan de restore antes de operaciones destructivas.
- Validar en la **base** (constraints) además de en la app. La DB es la última defensa.

## ✍️ Naming (SQL — MySQL / PostgreSQL)

- Tablas: `snake_case`, en plural → `users`, `order_items`.
- Columnas: `snake_case` → `created_at`, `user_id`.
- Claves foráneas: `<tabla_singular>_id` → `user_id`.
- Índices: `idx_<tabla>_<columnas>`. PK: `id` (preferir `uuid` o `bigint` autoincremental).
- Timestamps: `created_at`, `updated_at` (y `deleted_at` si hay soft-delete).

## 🐬🐘 SQL relacional (MySQL / PostgreSQL)

- Definir tipos correctos (no todo `varchar`); usar `enum`/check constraints cuando aplique.
- Claves foráneas con `ON DELETE`/`ON UPDATE` explícitos.
- Índices en columnas de búsqueda y FKs. Medir antes de optimizar.
- **Consultas parametrizadas siempre** (prevención de SQL injection); nunca concatenar input.
- Transacciones para operaciones multi-tabla que deben ser atómicas.
- PostgreSQL: aprovechar `jsonb`, `uuid`, índices parciales cuando convenga.

## 🟢 Supabase

- **Row Level Security (RLS) activado en todas las tablas** con datos de usuario. Sin
  políticas, nadie accede. Definir policies explícitas por operación.
- Usar la **anon key** en el cliente; la **service_role key** SOLO en backend/servidor
  (nunca exponerla en el frontend).
- Migraciones con la CLI de Supabase, versionadas en el repo.
- Aprovechar Auth y Storage nativos; validar permisos también del lado servidor.

## 🔥 Firebase / Firestore

- Modelar según los **accesos de lectura** (NoSQL: diseñar por queries, no por entidades).
- **Security Rules** restrictivas por defecto; deny-all y abrir lo justo. Testearlas.
- Evitar lecturas/escrituras masivas innecesarias (cada operación cuesta). Paginar.
- Desnormalizar con criterio para evitar lecturas múltiples; cuidar la consistencia.
- Nunca confiar solo en reglas del cliente: validar también en Cloud Functions si hay lógica sensible.

## 🔐 Seguridad de datos

- Hash de contraseñas (nunca en texto plano).
- Datos sensibles/PII: cifrado en reposo cuando aplique, acceso mínimo necesario.
- Logs sin datos sensibles.
