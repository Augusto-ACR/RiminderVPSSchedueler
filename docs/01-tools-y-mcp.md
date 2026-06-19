# 🧰 01 — Tools, MCP, Skills, Subagentes y Hooks

> Este doc resuelve la duda de fondo: **¿qué formas hay de "darle capacidades" a Claude
> Code y cuál conviene en cada caso?** Es la base para decidir si más adelante querés
> sumar MCP o tools propias.

## El panorama en una frase

Claude Code tiene **herramientas integradas**, y vos las podés **extender** (MCP),
**guionar** (skills/comandos), **delegar** (subagentes) y **automatizar** (hooks).

---

## 1. 🔧 Tools integradas (built-in)

Son las herramientas que Claude ya tiene de fábrica: leer/escribir/editar archivos,
buscar (grep/glob), ejecutar comandos de terminal, navegar la web, etc.

- **No las configurás vos**, vienen incluidas.
- Lo que sí controlás es **qué puede hacer sin pedirte permiso**, vía la allowlist de
  `permissions` en `.claude/settings.json` (ver `02-hooks.md` y la sección de permisos).

**Cuándo alcanza con esto:** la mayoría del trabajo de desarrollo (editar código, correr
tests, git) usa solo tools built-in.

---

## 2. 🔌 MCP (Model Context Protocol) — tools externas

MCP es el **estándar para conectar Claude a sistemas externos** y darle herramientas que
no trae de fábrica: una base de datos, una API, Gmail, Slack, Notion, Jira, etc.

- Un **servidor MCP** expone tools (y datos) que Claude puede usar.
- Se configuran en un archivo `.mcp.json` (a nivel proyecto) o en la config global.
- Ejemplos útiles para tu stack: un MCP de **PostgreSQL/Supabase** para consultar la DB,
  uno de **GitHub** para PRs/issues, uno de **filesystem** para acceso estructurado.

**Cuándo conviene:** cuando necesitás que Claude **interactúe con un sistema externo
real** (no solo con tu código). Ej: "consultá la tabla de usuarios y decime cuántos hay".

> ⚠️ En esta plantilla **todavía no configuramos ningún MCP** (fue una decisión: definir
> primero qué tools propias querés). Cuando lo decidas, se agrega un `.mcp.json`.

---

## 3. ⚡ Skills / Comandos (`/comando`)

Son **guiones reutilizables**: un archivo markdown en `.claude/commands/` que define un
flujo o prompt que invocás con `/nombre`.

- No agregan capacidades nuevas; **orquestan las que ya hay** de forma repetible.
- Ejemplos en esta plantilla: `/context`, `/knowledge`, `/commit`, `/prettier`,
  `/security`, `/feature` (ver `03-comandos.md`).

**Cuándo conviene:** cuando repetís un mismo pedido seguido y querés estandarizarlo
("formateá", "armá el commit", "auditá seguridad").

> **Comandos vs Agent Skills.** Además de los comandos en `.claude/commands/`, la plantilla
> trae **Agent Skills vendorizados** en `.claude/skills/` (cada uno una carpeta con su
> `SKILL.md`): se activan por su `description` cuando la tarea encaja, sin tipear un
> `/comando`. Ejemplos: `grilling`, `diagnosing-bugs`, `mcp-builder`, `web-design-guidelines`,
> `brand-guidelines`. Cómo sumar más y dónde (plantilla/global/proyecto): ver
> `06-extender-skills-mcp.md`.

---

## 4. 🤖 Subagentes

Son **asistentes especializados** con su propio rol, instrucciones y (opcionalmente) un
set de tools acotado. Viven en `.claude/agents/`.

- Cada uno corre en su **propio contexto** y devuelve un resultado al agente principal.
- Sirven para **delegar** tareas que se benefician de un foco específico.
- Ejemplos: `product-manager`, `architect`, `tech-lead`, `code-reviewer`,
  `security-reviewer` (ver `04-subagentes.md`).

**Cuándo conviene:** tareas que quieren una "mentalidad" dedicada (revisar seguridad,
diseñar arquitectura) o trabajo que conviene aislar del hilo principal.

---

## 5. 🪝 Hooks

Son **scripts que el sistema ejecuta automáticamente** ante ciertos eventos (al editar un
archivo, al terminar una respuesta, al iniciar sesión, etc.).

- A diferencia de todo lo anterior, **no dependen del criterio de Claude**: los corre el
  harness siempre que ocurre el evento. Por eso sirven para reglas tipo "cada vez que X".
- Ejemplos en esta plantilla: formateo automático, notificación al terminar, carga de
  `CONTEXT.md` al iniciar (ver `02-hooks.md`).

**Cuándo conviene:** automatizaciones determinísticas y garantizadas (formatear, validar,
loguear, proteger archivos, inyectar contexto).

---

## 📌 Tabla resumen — ¿cuál uso?

| Quiero... | Usá |
|---|---|
| Editar código, correr tests, git | Tools **built-in** |
| Conectar con DB / API / servicio externo | **MCP** |
| Repetir un flujo/pedido estandarizado | **Skill/comando** |
| Delegar a un rol especializado | **Subagente** |
| Que algo pase SIEMPRE ante un evento | **Hook** |

## 🧭 Para decidir MCP más adelante

Buenas preguntas para vos:
- ¿Querés que Claude consulte tu base de datos real (Supabase/PostgreSQL) en vez de solo
  leer el código?
- ¿Querés que cree/lea issues o PRs en GitHub?
- ¿Algún servicio que uses seguido (Notion, Jira, etc.)?

Si alguna da que sí, ahí tiene sentido sumar un MCP. Avisame y lo configuramos.
