# 🎨 Convenciones — Frontend (Vue 3 · TailwindCSS)

> Guía general para el frontend. Ajustá lo que no aplique en `PROJECT_RULES.md`.

## 🧭 Principios

- **Vue 3 con `<script setup>` + Composition API.** Evitar Options API en componentes nuevos.
- **TypeScript** en componentes y composables siempre que el proyecto lo permita.
- **Componentes chicos y enfocados.** Si un componente hace demasiado, dividir.
- **Estado:** local con `ref`/`reactive`; global con Pinia (no Vuex). Un store por dominio.
- **Lógica reutilizable → composables** (`useX`) en `src/composables/`.

## 📁 Estructura sugerida

```
src/
├── assets/
├── components/         # componentes reutilizables (UI tonta)
├── views/ (o pages/)   # vistas asociadas a rutas
├── composables/        # lógica reutilizable (useAuth, useFetch, ...)
├── stores/             # Pinia stores
├── router/
├── services/ (o api/)  # llamadas HTTP centralizadas
└── types/              # tipos/interfaces compartidos
```

## ✍️ Naming

- Componentes: `PascalCase` multi-palabra → `UserCard.vue`, `BaseButton.vue`.
  Prefijos útiles: `Base*` (UI genérica), `The*` (única en la app), `App*`.
- Composables: `camelCase` con prefijo `use` → `useAuth.ts`.
- Props: `camelCase` en JS, `kebab-case` en el template.
- Eventos emitidos: `kebab-case` con verbo → `@update:model-value`, `@submit`.

## 🧩 Componentes

- Tipar `props` y `emits` (con `defineProps<...>()` / `defineEmits<...>()`).
- Props **siempre** abajo→arriba; cambios de estado vía eventos o store, nunca mutar props.
- Preferir `v-model` y slots para componibilidad.
- Keys estables en `v-for` (nunca el índice si la lista cambia).

## 🎨 Estilos con TailwindCSS

> Las reglas de **estética y UX** (sobrio, profesional, sin emojis, bordes sutiles, paleta
> refinada) están en [`design.md`](design.md) y son de cumplimiento obligatorio.

- **Utility-first:** clases de Tailwind en el template. Evitar CSS custom salvo necesidad.
- Para combinaciones repetidas: extraer un **componente**, no `@apply` por todos lados.
- Orden de clases consistente (recomendado: `prettier-plugin-tailwindcss` para ordenarlas solo).
- Diseño **mobile-first**: estilos base + breakpoints (`sm: md: lg:`).
- Tokens de diseño (colores, espaciados) en `tailwind.config` — no hardcodear hex sueltos.

## 🌐 Datos y API

- Centralizar llamadas HTTP en `services/`; los componentes no usan `fetch`/`axios` directo.
- Manejar siempre los 3 estados: **loading / error / success**.
- Tipar las respuestas de la API.

## ♿ Accesibilidad y UX

- HTML semántico (`button` para acciones, `a` para navegar).
- Labels en inputs, `alt` en imágenes, foco visible.
- Estados de carga y mensajes de error claros para el usuario.

## 🧪 Testing

- Componentes con Vitest + Vue Test Library. Testear comportamiento, no implementación.
