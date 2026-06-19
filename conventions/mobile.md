# 📱 Convenciones — Mobile (React Native · Expo)

> Guía general para mobile. Las reglas **visuales** (sobrio, profesional, moderno) están
> en [`design.md`](design.md) y aplican también acá. Ajustá lo específico en `PROJECT_RULES.md`.

## 🧭 Stack y versión

- **React Native + Expo.**
- **Expo SDK 54 obligatoria por el momento.** No subir/bajar de versión sin acuerdo
  explícito (puede romper dependencias nativas). Verificar compatibilidad de cada lib
  con SDK 54 antes de instalarla.
- **TypeScript** siempre.
- **Expo Router** para navegación basada en archivos (preferido sobre React Navigation
  manual, salvo que el proyecto ya use otra cosa).

## 🧩 Principios

- **Componentes funcionales + hooks.** Nada de class components.
- Componentes chicos y reutilizables. Lógica reutilizable → hooks `useX` en `hooks/`.
- **Estado:** local con `useState`/`useReducer`; global con Zustand o Context (un store
  por dominio). Evitar prop-drilling profundo.
- Listas grandes con `FlatList`/`FlashList` (nunca `map` dentro de `ScrollView` para
  listas largas). Keys estables.
- Side-effects de datos: React Query / TanStack Query o un service centralizado.

## 📁 Estructura sugerida (Expo Router)

```
app/                    # rutas (file-based routing de Expo Router)
├── _layout.tsx
├── index.tsx
└── (tabs)/ ...
src/ (o raíz)
├── components/         # UI reutilizable
├── hooks/             # hooks reutilizables
├── stores/            # estado global
├── services/ (o api/)  # llamadas HTTP
├── theme/             # tokens de diseño (colores, spacing, tipografía)
└── types/
```

## ✍️ Naming

- Componentes: `PascalCase` → `UserCard.tsx`. Hooks: `useCamelCase` → `useAuth.ts`.
- Rutas de Expo Router según convención de archivos (`[id].tsx`, `(group)/`, `_layout.tsx`).

## 🎨 Estilo y UI

- Seguir [`design.md`](design.md): estética **sobria, profesional y moderna**;
  **sin emojis** en la UI; bordes sutiles; paleta refinada (ni demasiado plana ni chillona).
- Estilos con `StyleSheet.create` o la solución del proyecto (ej. NativeWind/Tailwind RN
  si está configurado). Centralizar tokens en `theme/`, no hardcodear colores sueltos.
- Diseñar para múltiples tamaños de pantalla y notch/safe areas (`SafeAreaView`,
  `react-native-safe-area-context`).
- Respetar el feeling nativo de cada plataforma (iOS/Android) cuando aplique.
- Aprovechar capacidades nativas para una UX pulida y moderna, **con criterio**:
  feedback háptico (`expo-haptics`) en acciones que lo ameriten —no en cada tap—,
  gestos (`react-native-gesture-handler`) y animaciones fluidas (`react-native-reanimated`).
- Respetar las preferencias del sistema (háptica desactivada, "reduce motion"): degradar
  con elegancia, nunca forzar.

## ⚡ Performance

- Memoizar (`memo`, `useMemo`, `useCallback`) donde haya re-renders costosos, no por default.
- Optimizar imágenes (`expo-image`). Evitar trabajo pesado en el hilo de JS.
- Cuidar el tamaño del bundle; revisar libs nativas pesadas.

## 🔐 Seguridad y datos sensibles

- Secretos/keys: nunca hardcodear. Usar variables de entorno de Expo (`app.config` +
  `expo-constants`) y `expo-secure-store` para tokens en el dispositivo.
- Nada de credenciales sensibles embebidas en el cliente.

## 🧪 Testing

- Lógica/hooks con Jest. Componentes con React Native Testing Library.
