# DEPLOY.md — Scheduler de Rimainder

Guía de deploy del scheduler a la VPS de Hostinger, donde ya corren el agente, OpenWA y
Postgres. El scheduler es un servicio aparte (su propio repo e imagen) que se une a las redes
existentes para leer la base del agente y enviar por OpenWA.

> **Regla de oro:** la **migración SQL va ANTES de subir el agente nuevo**. El agente nuevo
> usa la columna `aviso_min`; si arranca sin ella, se rompe. La migración es aditiva y segura
> para el agente viejo (la ignora).

---

## 📋 Datos que necesito de vos

1. **(Ahora)** La URL del repo de GitHub que creaste, para hacer el push.
2. **(En el paso 3)** La salida de estos dos comandos en la VPS, para fijar bien los nombres
   de red en el `.env`:
   ```bash
   docker network ls
   docker ps --format "table {{.Names}}\t{{.Image}}"
   ```
3. Confirmá el **nombre del contenedor de la base del agente** (suele ser algo como
   `whatsapp-agentkit-agent-postgres-1`) y el **usuario de Postgres** (`POSTGRES_USER` del
   `.env` del agente). Los secretos NO me los pases: los ponés vos directo en el `.env` del
   scheduler.

---

## 🧑‍💻 Tu parte, paso a paso (en la VPS)

### Paso 1 — Backup de la base del agente (red de seguridad)

```bash
# Ajustá el nombre del contenedor de postgres y el usuario.
docker exec -t <agent-postgres-container> pg_dump -U <POSTGRES_USER> agent_db \
  > ~/backup_agent_$(date +%F).sql
ls -lh ~/backup_agent_*.sql   # confirmá que pesa algo
```

### Paso 2 — Traer el repo del scheduler a la VPS

```bash
cd ~
git clone <URL_DEL_REPO> rimainder-scheduler
cd rimainder-scheduler
```

### Paso 3 — Confirmar las redes Docker

```bash
docker network ls                                    # buscá la red interna del agente y openwa-network
docker ps --format "table {{.Names}}\t{{.Image}}"    # confirmá nombres de contenedores
```

Pasame esa salida (dato #2). Con eso fijamos `AGENT_DB_NETWORK` y `OPENWA_NETWORK` en el `.env`.

### Paso 4 — Configurar el `.env` del scheduler (arrancamos en modo MOCK, sin mandar WhatsApp)

```bash
cp .env.example .env
nano .env
```

Completá:

```env
PORT=3000
NODE_ENV=production
# Misma base del agente. Usuario/clave = POSTGRES_USER/POSTGRES_PASSWORD del .env del agente.
DATABASE_URL=postgresql://<POSTGRES_USER>:<POSTGRES_PASSWORD>@agent-postgres:5432/agent_db
TIMEZONE=America/Argentina/Buenos_Aires
SCHEDULER_GRACIA_MIN=60
STUCK_TIMEOUT_MIN=5

# 👇 Arrancamos en MOCK: lee la base real pero NO manda WhatsApp, solo loguea.
SENDER_DRIVER=mock

# OpenWA (se usan recién en el paso 7). Copiá los valores del .env del agente.
OPENWA_URL=http://openwa-api:2785
OPENWA_API_KEY=<misma key del agente>
OPENWA_SESSION_ID=<mismo session id del agente>

# Nombres de red (ajustar según el Paso 3).
AGENT_DB_NETWORK=whatsapp-agentkit_internal
OPENWA_NETWORK=openwa-network
```

### Paso 5 — Aplicar la migración SQL (aditiva, segura para el agente viejo)

```bash
# Opcional pero recomendado: probarla primero en una copia del dump del Paso 1.
# Camino directo (la migración es idempotente y aditiva):
docker exec -i <agent-postgres-container> psql -U <POSTGRES_USER> -d agent_db \
  < migrations/001_scheduler_columns.sql

# Verificá que las columnas quedaron:
docker exec -it <agent-postgres-container> psql -U <POSTGRES_USER> -d agent_db \
  -c "\d eventos"
```

El agente que ya está corriendo **sigue andando igual** (ignora las columnas nuevas).

### Paso 6 — Levantar el scheduler en MOCK y verificar

```bash
docker compose -f docker-compose.prod.yml up -d --build
docker logs -f rimainder-scheduler        # mirá los ticks cada minuto
curl http://127.0.0.1:3000/health         # debería decir db:"up"
```

Qué esperar en el log: cada minuto un `Tick: encontrados=... enviados=...`. Si tenés eventos
futuros próximos, vas a ver líneas `[MOCK] Enviaría a ...` **sin** que llegue ningún WhatsApp.
👉 Avisame qué ves acá antes de seguir.

### Paso 7 — Pasar a envío REAL (probando a TU número)

1. Desde WhatsApp, pedile al agente: _"recordame en 2 minutos probar el scheduler"_.
2. Cambiá el driver a real:
   ```bash
   nano .env        # SENDER_DRIVER=openwa
   docker compose -f docker-compose.prod.yml up -d   # recrea con el nuevo .env
   ```
3. En 1-2 minutos debería llegarte el WhatsApp del recordatorio. Confirmá en la base:
   ```bash
   docker exec -it <agent-postgres-container> psql -U <POSTGRES_USER> -d agent_db \
     -c "SELECT id, titulo, fecha_hora, notif_estado, notificado FROM eventos ORDER BY id DESC LIMIT 5;"
   ```
   El evento debería quedar `notif_estado='enviado'`.

> Antes del primer envío real conviene chequear el formato de los números guardados:
>
> ```bash
> docker exec -i <agent-postgres-container> psql -U <POSTGRES_USER> -d agent_db \
>   < migrations/check_numero_format.sql
> ```

### Paso 8 — Redeploy del agente con `aviso_min` (recién ahora)

Esto habilita que el usuario diga _"avisame 30 min antes"_ y se guarde. En la carpeta del
agente, traé los cambios nuevos y reconstruí:

```bash
cd ~/whatsapp-agentkit      # o donde tengas el repo del agente
git pull                    # si subiste los cambios del agente a su repo
docker compose up -d --build agent
```

Prueba final: _"recordame mañana a las 21 entregar el TP, avisame 30 minutos antes"_ → el aviso
debería llegar 20:30.

---

## 🔙 Rollback rápido

- **Scheduler**: `docker compose -f docker-compose.prod.yml down` (no toca la base ni el agente).
- **Migración**: `migrations/001_rollback.sql` (solo si hace falta; borra las columnas del scheduler).
- **Base**: restaurar el dump del Paso 1.
