# 🖥️ Convenciones — Backend (Node.js · NestJS · TypeScript)

> Guía general para el backend. Ajustá lo que no aplique a tu proyecto en
> `PROJECT_RULES.md`.

## 🧭 Principios

- **TypeScript estricto:** `strict: true`. Evitar `any`; preferir tipos explícitos en
  límites públicos (params, returns de servicios y controllers).
- **Arquitectura modular de NestJS:** un módulo por dominio/feature. Nada de un módulo
  gigante. Cada módulo expone solo lo necesario.
- **Separación de responsabilidades:**
  - `Controller` → recibe la request, valida y delega. Sin lógica de negocio.
  - `Service` → lógica de negocio. Es donde vive el "qué hace".
  - `Repository` / acceso a datos → consultas. Aislar el ORM/cliente de DB.
- **Inyección de dependencias:** usar el DI de Nest; no instanciar servicios a mano.

## 📁 Estructura sugerida

```
src/
├── main.ts
├── app.module.ts
├── common/                 # guards, interceptors, pipes, filtros, decorators, utils
├── config/                 # configuración tipada (ConfigModule)
└── modules/
    └── <feature>/
        ├── <feature>.module.ts
        ├── <feature>.controller.ts
        ├── <feature>.service.ts
        ├── dto/            # DTOs de entrada/salida
        ├── entities/       # entidades / modelos
        └── <feature>.spec.ts
```

## ✍️ Naming

- Archivos: `kebab-case` con sufijo de rol → `users.service.ts`, `create-user.dto.ts`.
- Clases: `PascalCase` → `UsersService`, `CreateUserDto`.
- Variables/funciones: `camelCase`. Constantes globales: `UPPER_SNAKE_CASE`.
- Booleanos: prefijo `is/has/should` → `isActive`, `hasAccess`.

## ✅ Validación y DTOs

- Validar **toda** entrada con DTOs + `class-validator` y `ValidationPipe` global
  (`whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`).
- No exponer entidades de DB directamente; mapear a DTOs de salida.

## 🚨 Manejo de errores

- Usar las `HttpException` de Nest (`NotFoundException`, `BadRequestException`, etc.).
- Un **exception filter** global para formato de error consistente.
- No tragar errores con `catch` vacío. Loguear con contexto.

## 🔐 Seguridad (básico)

- `helmet`, CORS configurado explícitamente, rate limiting en endpoints públicos.
- Nunca loguear secretos, tokens ni contraseñas.
- Hash de contraseñas con `bcrypt`/`argon2`. JWT con expiración y refresh.
- Configuración por entorno con `@nestjs/config` (validar el `.env` al arrancar).

## ⚡ Async y performance

- `async/await` siempre; nunca mezclar con callbacks. Manejar promesas rechazadas.
- Evitar trabajo bloqueante en el event loop. Paginar listados.

## 🧪 Testing

- Unit tests de services con mocks de dependencias (Jest).
- e2e para los flujos críticos de la API.
- Nombrar: `describe('UsersService')` → `it('debería ...')`.


## 🧰 Buenas prácticas generales

- **Acceso a datos vía ORM en bases relacionales** (MySQL/PostgreSQL): TypeORM por
  defecto. Centralizar el acceso; no escribir SQL suelto por el código.
- Para **Firebase/Firestore** (NoSQL) usar su SDK; para **Supabase**, el cliente oficial
  o un ORM (TypeORM/Prisma) sobre la conexión Postgres, según convenga al proyecto.
- Excepción: para queries muy complejas o críticas en performance, se permite query
  builder / SQL parametrizado (nunca concatenar input).
