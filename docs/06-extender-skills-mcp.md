# 🧩 06 — Extender la plantilla con skills, subagentes y MCP

> Cómo decidir **qué sumar y dónde**, sin romper la portabilidad de la plantilla. Este doc
> es el *por qué* y el criterio; para el *cómo instalo ya* de las piezas por-proyecto, ver
> [`Especificos.txt`](../Especificos.txt) en la raíz.

## El criterio: 3 niveles

No todo va al mismo lugar. Antes de instalar algo, preguntate **¿dónde vive?**

| Nivel | Dónde | Viaja con la plantilla | Cuándo |
|---|---|---|---|
| **Plantilla** | `.claude/` de este repo | ✅ Sí (se copia a cada proyecto) | Lo querés en **el 80%+** de tus proyectos. |
| **Global** | `~/.claude/` (tu máquina) | ❌ No | Es **tuyo personal**, lo querés en todo proyecto (incluso fuera de esta plantilla). |
| **Por proyecto** | `.claude/` del proyecto puntual | ❌ No | Depende de **qué hace ese proyecto**. |

Regla mental: *¿universal de trabajo?* → plantilla · *¿personal sin importar el proyecto?* →
global · *¿específico de este proyecto?* → por proyecto.

> ⚠️ **Cuidado con el peso.** Cada skill/subagente compite por contexto. Más no es mejor:
> curá. Y ojo con skills que arrastran binarios o assets pesados (ej. fuentes) → mejor a
> nivel global que en la plantilla, para no bloatear cada proyecto.

## Seguridad / vetting (antes de instalar CUALQUIER cosa externa)

Un skill o MCP externo corre con **tus permisos**. Siempre:

1. **Leé el `SKILL.md`** (y scripts que traiga) antes de instalar. ¿Hace algo inesperado?
2. **Fijá la versión** (commit/tag). No dependas de "lo último" sin revisar.
3. **Distinguí fuente:** oficial (Anthropic, Vercel) > autor conocido de la comunidad >
   repo random. A más confianza, menos fricción; ante la duda, no lo instales.
4. **Vendorizá** (copiá el contenido al repo con atribución) en vez de hacer *fetch* a ciegas
   en runtime, para que la plantilla quede autocontenida y reproducible.

Cada skill vendorizado lleva un `SOURCE.md` con fuente, autor, licencia y commit fijado.

## Qué quedó instalado y dónde (estado actual)

### En la plantilla — `.claude/skills/`
| Skill | Qué hace | Fuente |
|---|---|---|
| `grill-me` + `grilling` | Interroga el plan/diseño antes de codear | mattpocock/skills (MIT) |
| `diagnosing-bugs` | Loop de diagnóstico para bugs difíciles (trigger: "diagnose") | mattpocock/skills (MIT) |
| `mcp-builder` | Guía para construir servidores MCP (Py/TS) | anthropics/skills (Apache 2.0) |
| `web-design-guidelines` | Audita UI contra las guidelines de Vercel | vercel-labs/agent-skills |
| `brand-guidelines` | Aplica la marca de Anthropic a artefactos | anthropics/skills (Apache 2.0) |

### En la plantilla — `.claude/agents/`
- `deployment` — build, env, hosting y deploy.
- `version-control` — flujo Git, ramas, conflictos, `.gitignore`, PRs.

### Global — `~/.claude/skills/` (NO viaja con la plantilla)
- `caveman` — modo de comunicación ultra-comprimido (preferencia personal).
- `canvas-design` — arte visual en .png/.pdf. Va global porque arrastra **~5,3 MB de
  fuentes**; en la plantilla bloatearía cada proyecto.

## Lo que NO se instaló (y por qué) — va por proyecto

Ver comandos concretos en [`Especificos.txt`](../Especificos.txt).

| Pieza | Por qué no está en la plantilla |
|---|---|
| **AgentBrowser** | Automatización de navegador; trae binario Node. Solo si el proyecto hace E2E/scraping. |
| **WhatsApp AgentKit** | No es un skill: es un **andamio que genera un proyecto** de WhatsApp. Se usa cuando tenés ese proyecto. |
| **docx/pdf/pptx/xlsx (Anthropic)** | **Source-available, NO open source** → no se redistribuyen en una plantilla. Parte ya viene integrado en Claude. Sumar por proyecto si hace falta. |
| **Agente de legales** | Nicho. Por proyecto, o global si lo usás seguido. |
| **InDesign / generación de documentos de diseño** | Muy específico. Por proyecto. |

## Sobre MCP

MCP conecta Claude a sistemas externos (DB, APIs, servicios). Esta plantilla **no trae MCP
configurado** a propósito (ver [`01-tools-y-mcp.md`](01-tools-y-mcp.md)). Cuando un proyecto
lo necesite, se agrega un `.mcp.json` en ese proyecto. Para **construir** tu propio servidor
MCP, usá el skill `mcp-builder` (ya en la plantilla).

## Cómo agregar un skill nuevo a la plantilla (resumen)

1. Vetealo (sección de seguridad de arriba).
2. Copiá la carpeta completa del skill a `.claude/skills/<nombre>/` (no solo `SKILL.md`:
   también `reference/`, `scripts/`, etc. si los trae).
3. Agregá un `SOURCE.md` con fuente, autor, licencia y commit.
4. Documentalo en `CLAUDE.md` (sección Skills) y en este doc.
5. Reiniciá Claude Code para que lo cargue.
