# 🪝 02 — Hooks

> Los hooks son scripts que Claude Code ejecuta **automáticamente** ante ciertos eventos.
> Se registran en `.claude/settings.json` y los scripts viven en `.claude/hooks/`.
>
> ⚠️ Los hooks se cargan **al iniciar la sesión**. Si los modificás, **reiniciá Claude
> Code** (o `/clear`) para que tomen efecto.

## Hooks incluidos en esta plantilla

| Evento | Script | Qué hace |
|---|---|---|
| `SessionStart` | `load-context.ps1` | Inyecta `CONTEXT.md` como contexto al iniciar la sesión. |
| `PostToolUse` (Edit\|Write) | `format.ps1` | Formatea con Prettier el archivo recién editado. |
| `Stop` | `notify.ps1` | Beep + notificación de Windows al terminar una respuesta. |

## Detalle

### 🟢 load-context.ps1 (SessionStart)
- Lee `CONTEXT.md` y lo imprime; Claude Code agrega ese stdout al contexto inicial.
- Si `CONTEXT.md` no existe, no hace nada.
- Maneja UTF-8 explícitamente (PS 5.1 usa ANSI por defecto y rompería los acentos).

### 🎨 format.ps1 (PostToolUse)
- Recibe por stdin el JSON del evento y extrae el archivo editado.
- Formatea con `npx --no-install prettier --write` **solo si Prettier está instalado** en
  el proyecto. Si no, sale sin hacer nada (no rompe).
- Extensiones: `.js .jsx .ts .tsx .vue .css .scss .json .md .html`.

### 🔔 notify.ps1 (Stop)
- Hace un beep doble y muestra un globo de notificación de Windows.
- **Para desactivarlo:** borrá el bloque `"Stop"` de `.claude/settings.json`.

## Cómo activar / desactivar un hook

Editá `.claude/settings.json` y agregá o quitá el bloque del evento correspondiente.
Estructura general:

```json
{
  "hooks": {
    "EventName": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          { "type": "command", "command": "powershell -NoProfile -ExecutionPolicy Bypass -File \"${CLAUDE_PROJECT_DIR}/.claude/hooks/script.ps1\"", "timeout": 30 }
        ]
      }
    ]
  }
}
```

- `${CLAUDE_PROJECT_DIR}` → ruta absoluta del proyecto (la setea Claude Code). Hace que la
  ruta del script sea portable.
- `matcher` → en `PostToolUse`/`PreToolUse` filtra por nombre de tool (`Edit|Write`,
  `Bash`, etc.). En `SessionStart` filtra por origen (`startup`, `resume`, `clear`,
  `compact`); omitirlo aplica a todos.
- `timeout` → segundos máximos que puede tardar el hook.

## Otros eventos disponibles (para crear más)

`PreToolUse`, `PostToolUse`, `UserPromptSubmit`, `Stop`, `SubagentStop`, `SessionStart`,
`SessionEnd`, `Notification`, `PreCompact`, entre otros. Casos típicos: bloquear edición
de archivos sensibles (`PreToolUse`), loguear comandos, validar antes de commitear.

## Probar un hook a mano

```powershell
$env:CLAUDE_PROJECT_DIR = "C:\ruta\al\proyecto"
powershell -NoProfile -ExecutionPolicy Bypass -File "$env:CLAUDE_PROJECT_DIR\.claude\hooks\load-context.ps1"
```
