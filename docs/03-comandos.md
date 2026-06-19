# ⚡ 03 — Comandos (`/comando`)

> Los comandos son guiones reutilizables en `.claude/commands/`. Cada archivo `.md` define
> un comando `/<nombre>`. El frontmatter (`description`, `argument-hint`, `allowed-tools`)
> configura el comando; el cuerpo es el prompt que se ejecuta.

## Comandos incluidos

| Comando | Para qué | Argumento |
|---|---|---|
| `/feature` | Planificar una feature nueva de punta a punta (PM → Architect → Tech-lead). | descripción de la feature |
| `/context` | Actualizar `CONTEXT.md` (estado del proyecto) de forma ordenada. | nota a registrar |
| `/knowledge` | Registrar un error + solución en `knowledge/`. | descripción del problema resuelto |
| `/commit` | Armar un commit en formato Conventional Commits. | contexto opcional |
| `/prettier` | Formatear el proyecto o archivos puntuales con Prettier. | ruta/glob opcional |
| `/security` | Auditoría de seguridad vía el subagente `security-reviewer`. | alcance opcional |

## Detalle

### 🧩 /feature
Orquesta el flujo completo de planificación con check-ins entre cada paso: el
**product-manager** saca requisitos y user stories, el **architect** diseña arquitectura/
API/DB, y el **tech-lead** lo baja a tareas. Ideal para sistemas o features grandes.
Ej: `/feature app de gimnasio con suscripciones, check-in y registro de entrenamientos`.

### 📝 /context
Sin argumentos, muestra el estado actual y pregunta qué actualizar. Con argumentos, mete
la info en la sección correcta de `CONTEXT.md` y actualiza la fecha.

### 🧠 /knowledge
Calcula el próximo número de entrada y crea `knowledge/NNNN-titulo.md` con el formato
Problema/Causa/Solución/Tags.

### ✅ /commit
Lee `git status`/`diff`, propone un mensaje convencional, **te lo muestra antes de
commitear** y agrega el trailer `Co-Authored-By`. No hace `push` solo.

### 🎨 /prettier
Formateo en lote bajo demanda (complementa al hook automático por-archivo). Detecta el
método (script de `package.json` → pnpm/npx) y no instala Prettier sin confirmar.

### 🔐 /security
Lanza al `security-reviewer` para auditar según el stack y devolver hallazgos ordenados
por severidad con ubicación y fix.

## Cómo crear un comando nuevo

Creá `.claude/commands/mi-comando.md`:

```markdown
---
description: Qué hace, en una línea
argument-hint: [qué espera como argumento]
allowed-tools: Bash(git status:*)
---

Instrucciones para Claude. Usá $ARGUMENTS para el texto que pasa el usuario.
Podés inyectar salida de comandos con !`comando` y referenciar archivos con @ruta.
```

- `$ARGUMENTS` → todo el texto pasado al comando.
- `!`comando`` → ejecuta el comando e inserta su salida en el prompt.
- `@ruta/archivo` → incluye el contenido del archivo.
- `allowed-tools` → tools que el comando puede usar sin pedir permiso.
