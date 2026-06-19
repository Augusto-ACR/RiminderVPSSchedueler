# 0001 — Ejemplo: error de CORS al llamar a la API de NestJS desde el frontend

> ⚠️ Esta es una **entrada de ejemplo** para mostrar el formato. Borrala (o reemplazala)
> cuando registres tu primer caso real.

## ❌ Problema
El frontend (Vue en `http://localhost:5173`) llama a la API de NestJS
(`http://localhost:3000`) y el navegador bloquea la respuesta con:

```
Access to fetch at 'http://localhost:3000/users' from origin 'http://localhost:5173'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present.
```

La request llega al backend, pero el navegador descarta la respuesta.

## 🔍 Causa
NestJS no trae CORS habilitado por defecto. Sin configurarlo, no envía el header
`Access-Control-Allow-Origin`, así que el navegador bloquea la respuesta por la
política same-origin.

## ✅ Solución
Habilitar CORS de forma explícita en `main.ts`, permitiendo solo los orígenes esperados
(no usar `*` si se manejan cookies/credenciales):

```ts
const app = await NestFactory.create(AppModule);
app.enableCors({
  origin: ['http://localhost:5173'], // orígenes permitidos por entorno
  credentials: true,
});
await app.listen(3000);
```

Para producción, leer los orígenes desde variables de entorno en vez de hardcodearlos.

## 🏷️ Tags
`backend` · `nestjs` · `cors` · `config`

---
_Fecha: 2026-06-18_
