# 🎯 Convenciones — Diseño visual (Frontend + Mobile)

> Reglas de **estética y UX** que aplican tanto al frontend web (Vue 3 / Tailwind) como a
> mobile (React Native / Expo). Objetivo: interfaces **sobrias, profesionales y modernas**.
>
> ⚠️ Importante: los emojis se usan en la documentación de esta plantilla solo por
> legibilidad. **En la UI y en el código que se genera, NO se usan emojis.**

## 🧭 Principios

- **Sobrio y profesional.** Menos es más. Sin elementos decorativos innecesarios.
- **Moderno y limpio.** Estética actual, no recargada.
- **Sin emojis en la interfaz** ni en textos de UI, labels, botones o copys.
  Usar iconografía vectorial consistente (un solo set de íconos) cuando se necesite un símbolo.
- **Coherencia ante todo:** mismos espaciados, radios, tipografías y colores en toda la app.

## 🎨 Color

- **Paleta refinada, ni plana ni chillona.** Evitar colores demasiado saturados o
  "primarios puros" (rojo/azul/verde crudos).
- Base **neutra** (grises, blancos rotos, tonos oscuros suaves) + **uno o dos colores de
  acento** usados con intención (acciones primarias, estados).
- Definir los colores como **tokens** (variables en `tailwind.config` / `theme/`),
  nunca hex sueltos repartidos por el código.
- Cuidar **contraste** (legibilidad y accesibilidad AA).
- Soportar modo claro/oscuro vía tokens cuando el proyecto lo pida.

## 🧱 Bordes, profundidad y formas

- **Bordes sutiles**, no marcados. Preferir líneas finas de bajo contraste (ej. gris claro)
  o separar por **espaciado y sombras suaves** en lugar de bordes gruesos.
- **Sombras suaves y difusas** para jerarquía/profundidad, no sombras duras.
- **Radios de borde moderados y consistentes** (ni cuadrado rígido ni excesivamente redondo).
- Evitar contornos negros gruesos y "cajas" muy marcadas.

## 📐 Espaciado y layout

- Escala de espaciado **consistente** (ej. múltiplos de 4/8). Generoso, con aire.
- Jerarquía visual clara: tamaño, peso y espacio guían la lectura, no los colores fuertes.
- **Mobile-first** y responsive; respetar safe areas en mobile.

## 🔤 Tipografía

- Una o dos familias máximo. Escala tipográfica definida (no tamaños arbitrarios).
- Jerarquía por peso y tamaño, no por colores estridentes.
- Buen interlineado y longitud de línea legible.

## ✨ Interacción y feedback

- Transiciones y animaciones **sutiles** (acompañan, no distraen).
- Estados claros para todo elemento interactivo: hover/press, focus, disabled, loading.
- Feedback inmediato en acciones (loading, éxito, error) con un lenguaje visual calmado.

## ♿ Accesibilidad

- Contraste suficiente, foco visible, áreas táctiles cómodas (mín. ~44px en mobile).
- No comunicar información solo por color.
