# 0002 — Jest: "Reflect.getMetadata is not a function" en tests unitarios aislados

## ❌ Problema

Un spec que importa SOLO una clase con decoradores de `class-validator`/`class-transformer`
(ej. `env.validation.spec.ts` importando `validateEnv`) falla al CARGAR la suite:

```
Test suite failed to run
TypeError: Reflect.getMetadata is not a function
  at .../class-transformer/.../type.decorator.ts
```

Los specs que importan módulos de NestJS NO fallan (Nest arrastra `reflect-metadata`), así
que el error aparece "salteado" solo en los tests más puros.

## 🔍 Causa

`reflect-metadata` (el polyfill de `Reflect.getMetadata`) no estaba cargado en ese proceso de
jest. En la app real lo carga NestJS al arrancar; en un unit test aislado, nadie lo importa.

## ✅ Solución

Cargar `reflect-metadata` una sola vez para TODOS los tests, en la config de jest
(`package.json`):

```json
"jest": {
  "setupFiles": ["reflect-metadata"],
  ...
}
```

(Alternativa puntual: `import 'reflect-metadata';` al tope del spec, pero `setupFiles` lo
resuelve global y evita que vuelva a pasar en futuros tests.)

## 🏷️ Tags

`backend` · `nestjs` · `typescript` · `jest` · `testing` · `class-validator`

---

_Fecha: 2026-06-19_
