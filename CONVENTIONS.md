# 📐 CONVENTIONS.md — Índice de convenciones

> Convenciones de código por capa. Son la **guía general** del stack; las reglas
> específicas e innegociables de cada proyecto viven en `PROJECT_RULES.md` (que tiene
> prioridad sobre esto).
>
> Consultá el archivo de la capa en la que estés trabajando:

| Capa | Archivo | Tecnologías |
|---|---|---|
| 🖥️ **Backend** | [`conventions/backend.md`](conventions/backend.md) | Node.js · NestJS · JavaScript · TypeScript |
| 🎨 **Frontend** | [`conventions/frontend.md`](conventions/frontend.md) | Vue 3 · HTML · CSS · JavaScript · TailwindCSS |
| 📱 **Mobile** | [`conventions/mobile.md`](conventions/mobile.md) | React Native · Expo (SDK 54) · TypeScript |
| 🎯 **Diseño visual** | [`conventions/design.md`](conventions/design.md) | Reglas de estética/UX para Frontend + Mobile |
| 🌐 **Implementación web** | [`conventions/design-web.md`](conventions/design-web.md) | Checklist técnico de UI web: a11y, forms, performance, hidratación (Vercel) |
| 🗄️ **Base de datos** | [`conventions/database.md`](conventions/database.md) | MySQL · PostgreSQL · Supabase · Firebase |

## Convenciones transversales (todas las capas)

- **Idioma del código:** nombres de variables/funciones en inglés; comentarios y docs en español.
- **Formateo:** Prettier (corre automático al editar vía hook, o manual con `/prettier`).
- **Commits:** Conventional Commits (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`).
- **Nada de secretos en el código:** usar variables de entorno (`.env`, nunca commitear).
- **Comentarios:** explicar el *por qué*, no el *qué*. Código autoexplicativo > comentarios.
- **UI sobria y sin emojis:** todo lo visual (Frontend + Mobile) sigue [`conventions/design.md`](conventions/design.md). Los emojis de estos `.md` son solo de documentación; **en código y UI no se usan emojis.**
