# 🧠 knowledge/ — Base de conocimiento del proyecto

> Registro vivo de **errores que costaron resolver y su solución**. La idea es no volver a
> pelear dos veces con el mismo problema. Antes de atacar un error, revisá si ya está acá.
>
> Se completa con el tiempo, a mano o con el comando `/knowledge`.

## 📂 Cómo está organizado

- **Un archivo por entrada**, con nombre `NNNN-titulo-corto.md`
  (numeración incremental de 4 dígitos: `0001`, `0002`, ...).
- Título corto y descriptivo en `kebab-case` → `0002-expo-metro-cache.md`.
- Cada entrada sigue siempre el mismo formato (ver plantilla abajo).

## 🏷️ Tags sugeridos

Para poder buscar rápido, usá tags consistentes. Algunos:

`backend` · `frontend` · `mobile` · `database` · `nestjs` · `vue` · `expo` ·
`react-native` · `typescript` · `supabase` · `firebase` · `postgres` · `mysql` ·
`build` · `deploy` · `config` · `auth` · `performance` · `cors`

## 🔎 Cómo buscar

- Por palabra clave o tag, mirá los archivos de la carpeta (o usá el buscador del editor).
- Cada entrada lista sus tags al final.

## 📝 Plantilla de entrada

Copiá esto para una entrada nueva (o usá `/knowledge`):

```markdown
# NNNN — Título corto del problema

## ❌ Problema
Qué pasaba, síntoma observable y contexto (versión de SDK, entorno, etc.).
Incluí el mensaje de error textual si lo hay.

## 🔍 Causa
Por qué pasaba. La raíz real, no el síntoma.

## ✅ Solución
Pasos concretos que lo resolvieron. Comandos / código si aplica.

## 🏷️ Tags
`tag1` · `tag2` · `tag3`

---
_Fecha: AAAA-MM-DD_
```
