# 🤖 04 — Subagentes (equipo virtual)

> Los subagentes son asistentes especializados, cada uno con su rol e instrucciones, en
> `.claude/agents/`. Corren en su propio contexto y devuelven un resultado al hilo
> principal. Modelan un **equipo** que cubre el ciclo de desarrollo.

## El equipo

| Subagente | Rol | Entrega |
|---|---|---|
| `product-manager` | Idea → requisitos | User stories, criterios de aceptación, backlog priorizado, MVP. |
| `architect` | Diseño técnico | Módulos, API, esquema de DB, trade-offs; anti sobre-ingeniería. |
| `tech-lead` | Plan de ejecución | Tareas concretas ordenadas, dependencias, riesgos, qué testear. |
| `code-reviewer` | Revisión de calidad | Bugs y mejoras por severidad (🔴🟡🔵). |
| `security-reviewer` | Auditoría de seguridad | Vulnerabilidades por severidad, con ubicación y fix. |
| `deployment` | Build / hosting / deploy | Recomendación de host, checklist de deploy, env vars, rollback. |
| `version-control` | Flujo Git | Estrategia de ramas, commits, conflictos, `.gitignore`, PRs. |

> `deployment` y `version-control` no son parte del flujo PM → Architect → Tech-lead: son
> ayudas transversales que usás cuando toca subir a producción o manejar el repo.

## Flujo típico de una feature

```
Idea
 └─ product-manager  → requisitos + user stories
     └─ architect    → arquitectura + API + DB
         └─ tech-lead → tareas concretas
             └─ (desarrollo)
                 ├─ code-reviewer     → calidad/bugs
                 └─ security-reviewer → seguridad
```

El comando **`/feature`** orquesta los tres primeros pasos automáticamente.

## Cómo se ejecutan

1. **Automático:** el agente principal puede delegar en un subagente cuando la tarea
   encaja con su `description`. Es una decisión basada en criterio (no garantizada).
2. **Explícito:** se lo pedís ("usá el architect para diseñar esto") o lo dispara un
   comando (`/security` → `security-reviewer`; `/feature` → PM/architect/tech-lead).

> La regla en `CLAUDE.md` empuja a que, ante features grandes, se proponga el flujo
> estructurado en vez de codear directo.

## El security-reviewer (el más exhaustivo)

Cubre, según el stack: secretos y validación de `.env`, inyección (SQL/NoSQL), auth (JWT
cuando no hay Supabase/Firebase, hashing, IDOR/BOLA), RLS de Supabase, Security Rules de
Firebase, rate limiting, CORS/headers, XSS, secure storage en mobile, validación de
inputs/uploads, y dependencias. Ver `.claude/agents/security-reviewer.md` para el checklist
completo.

## Cómo crear un subagente nuevo

Creá `.claude/agents/mi-agente.md`:

```markdown
---
name: mi-agente
description: Cuándo usar este agente (clave para la delegación automática).
tools: Read, Grep, Glob
---

Instrucciones / rol del subagente (su "system prompt").
```

- `name` → identificador (coincide con el nombre del archivo).
- `description` → cuanto más clara, mejor la delegación automática.
- `tools` → opcional; si lo omitís, hereda todas. Para revisores conviene acotar a
  herramientas de solo lectura (`Read, Grep, Glob`).
