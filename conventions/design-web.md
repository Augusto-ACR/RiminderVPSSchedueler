# 🌐 Convenciones — Implementación de interfaces web (Vercel Web Interface Guidelines)

> Checklist **técnico** para construir UIs web correctas (accesibilidad, forms, performance,
> hidratación, animación). Complementa a [`conventions/design.md`](design.md): aquel define
> **cómo se ve** (estética sobria); este define **cómo se implementa bien**.
>
> Aplica a la capa **Frontend** (Vue 3 / Tailwind). Mucho aplica también a mobile web.
>
> Adaptado de las *Web Interface Guidelines* de Vercel Labs. Fuente viva (para auditar con
> el skill `web-design-guidelines`):
> https://github.com/vercel-labs/web-interface-guidelines

## ♿ Accesibilidad

- Botones solo-ícono → `aria-label`. Controles de formulario → `<label>` o `aria-label`.
- Elementos interactivos con teclado (`onKeyDown`/`onKeyUp`); usar `<button>` para acciones y
  `<a>`/`<Link>` para navegar (nunca `<div onClick>`).
- Imágenes con `alt` (o `alt=""` si son decorativas); íconos decorativos con `aria-hidden="true"`.
- Actualizaciones async anunciadas con `aria-live="polite"`.
- HTML semántico antes que ARIA. Encabezados jerárquicos `<h1>`–`<h6>`, skip link, y
  `scroll-margin-top` en anclas.

## 🎯 Foco

- Todo elemento interactivo con foco visible (`focus-visible:ring-*`).
- Nunca `outline-none` sin reemplazo de foco. Preferir `:focus-visible` sobre `:focus`.
- Controles compuestos: agrupar con `:focus-within`.

## 📝 Formularios

- Inputs con `autocomplete` y `name` significativo; `type` correcto (`email`, `tel`, `url`,
  `number`) e `inputmode`.
- Nunca bloquear el pegado. Labels clickeables (`htmlFor` o envolviendo el control).
- Desactivar spellcheck en emails/códigos/usernames.
- Botón de submit habilitado hasta que arranca el request; mostrar spinner durante el envío.
- Errores inline y foco al primer error en el submit.
- Placeholders terminan en `…` y muestran el patrón esperado.
- Avisar antes de navegar si hay cambios sin guardar.

## ✨ Animación

- Respetar `prefers-reduced-motion`.
- Animar solo `transform`/`opacity`. Nunca `transition: all` (listar propiedades).
- `transform-origin` correcto; animaciones interrumpibles.

## 🔤 Tipografía y texto

- Usar `…` (no `...`) y comillas tipográficas (`"` `"`), no rectas.
- Espacios duros para unidades y nombres: `10&nbsp;MB`, `⌘&nbsp;+&nbsp;K`.
- Estados de carga con verbo + `…`: `"Guardando…"`.
- `font-variant-numeric: tabular-nums` en columnas numéricas.
- `text-wrap: balance` / `text-pretty` en títulos.

## 📦 Contenido variable

- Contenedores que soportan texto largo: `truncate`, `line-clamp-*` o `break-words`.
- Hijos flex con `min-w-0` para que el truncado funcione.
- Manejar estados vacíos y prever inputs cortos, promedio y muy largos.

## 🖼️ Imágenes y performance

- `<img>` con `width` y `height` explícitos. Below-the-fold: `loading="lazy"`;
  crítico above-the-fold: `priority` / `fetchpriority="high"`.
- Listas grandes (>50 ítems): virtualizar. No leer layout en render; batchear lecturas/escrituras DOM.
- `preconnect` a CDNs; precargar fuentes críticas con `font-display: swap`.

## 🧭 Navegación y estado

- La URL refleja el estado (filtros, tabs, paginación, paneles). Deep-link a toda UI con estado.
- `<a>`/`<Link>` para comportamiento nativo del navegador.
- Acciones destructivas con confirmación o undo.

## 👆 Touch e interacción

- `touch-action: manipulation`; `-webkit-tap-highlight-color` intencional.
- `overscroll-behavior: contain` en modales/drawers.
- `autoFocus` solo en desktop y un único input primario.

## 🌓 Dark mode y safe areas

- `color-scheme: dark` en `<html>` para temas oscuros; `<meta name="theme-color">` acorde.
- Layouts full-bleed con `env(safe-area-inset-*)`. Preferir Flex/Grid sobre medir con JS.

## 🌍 i18n e hidratación

- Fechas/números con `Intl.DateTimeFormat` / `Intl.NumberFormat`. Identificadores con `translate="no"`.
- Inputs con `value` necesitan `onChange` (o usar `defaultValue`). Cuidar mismatches de
  hidratación en fechas/horas; `suppressHydrationWarning` con moderación.

## ✍️ Copy

- Voz activa, segunda persona, conciso. Title Case en títulos/botones; numerales para conteos.
- Labels de botón específicos. Mensajes de error que incluyan el siguiente paso/arreglo.

---

> Para auditar una UI contra estas reglas (versión siempre actualizada), usá el skill
> **`web-design-guidelines`** sobre los archivos a revisar.
