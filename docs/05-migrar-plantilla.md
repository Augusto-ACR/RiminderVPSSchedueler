# 📦 05 — Migrar la plantilla a otro proyecto

> Esta carpeta es una **plantilla portable**. Para usarla en un proyecto nuevo o existente,
> copiás las piezas y ajustás lo específico. Acá está el paso a paso.

## Qué copiar

| Pieza | ¿Copiar? | Nota |
|---|---|---|
| `.claude/` (settings, hooks, commands, agents, **skills**) | ✅ Sí | El corazón de la configuración. Incluye los skills vendorizados. |
| `CLAUDE.md` | ✅ Sí | Ajustá lo que sea propio del nuevo proyecto. |
| `CONTEXT.md` | ✅ Sí, vaciándolo | Empezá de cero con el estado del nuevo proyecto. |
| `PROJECT_RULES.md` | ✅ Sí, completándolo | Llená las reglas reales del nuevo proyecto. |
| `CONVENTIONS.md` + `conventions/` | ✅ Si el stack coincide | Si cambia el stack, ajustá/quitá capas. |
| `knowledge/` | ⚠️ Empezá vacío | Borrá `0001-ejemplo.md`; el conocimiento es por proyecto. |
| `docs/` | Opcional | Útil como referencia; podés dejarlo o no. |
| `Especificos.txt` | Opcional | Guía de instalación de piezas por-proyecto (AgentBrowser, etc.). |

> Los skills **globales** (`~/.claude/skills/`: `caveman`, `canvas-design`) **no** se copian:
> ya están a nivel de tu máquina y aplican a todos los proyectos. Lo que viaja es
> `.claude/skills/` del repo. Detalle en [`06-extender-skills-mcp.md`](06-extender-skills-mcp.md).

## Paso a paso

1. **Copiá** `.claude/`, `CLAUDE.md`, `CONTEXT.md`, `PROJECT_RULES.md`, `CONVENTIONS.md` y
   `conventions/` a la raíz del proyecto destino.

   ```powershell
   # Ejemplo (PowerShell), desde la carpeta de la plantilla:
   $destino = "C:\ruta\al\proyecto-nuevo"
   Copy-Item -Recurse .\.claude $destino
   Copy-Item .\CLAUDE.md, .\CONTEXT.md, .\PROJECT_RULES.md, .\CONVENTIONS.md $destino
   Copy-Item -Recurse .\conventions $destino
   ```

2. **Vaciá `CONTEXT.md`** y completá el objetivo/stack/estado del proyecto nuevo (o usá
   `/context`).
3. **Completá `PROJECT_RULES.md`** con las reglas duras reales (los `<...>`).
4. **Ajustá `conventions/`** al stack real: si el proyecto no usa mobile, borrá
   `mobile.md`; si suma otra capa, agregá su archivo y enlazalo en `CONVENTIONS.md`.
5. **Vaciá `knowledge/`** (borrá `0001-ejemplo.md`, dejá el `README.md`).
6. **Revisá `.claude/settings.json`**: la allowlist y los hooks. Recordá que los hooks
   usan PowerShell (Windows). En macOS/Linux habría que portarlos a `.sh`.
7. **Reiniciá Claude Code** en el proyecto destino para que carguen hooks y settings.

## Si el proyecto usa Git

- Agregá a `.gitignore`:
  ```
  .claude/settings.local.json
  .env
  .env.*
  ```
- `.claude/settings.json` (compartido) **sí** se versiona; `settings.local.json` (personal)
  **no**.

## Verificación rápida en el destino

- Al iniciar, debería inyectarse `CONTEXT.md` (hook SessionStart).
- `/feature`, `/context`, `/security`, etc. deberían aparecer como comandos.
- Los subagentes deberían estar disponibles para delegar.
