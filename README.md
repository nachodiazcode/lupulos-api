# Lúpulos API

Backend oficial de **Lúpulos**, una plataforma enfocada en la comunidad cervecera: descubrimiento de cervezas, publicaciones sociales, lugares recomendados, mensajería entre usuarios y suscripciones premium.

La API está construida sobre **Node.js**, **Express** y **MongoDB**, y expone una arquitectura modular preparada para operar como servicio real: autenticación con JWT y refresh token, validación de requests, documentación Swagger, logging estructurado, uploads de media y reglas de autorización por roles, permisos y planes.

## Contenido

- [Resumen](#resumen)
- [Stack tecnológico](#stack-tecnológico)
- [Arquitectura del proyecto](#arquitectura-del-proyecto)
- [Capacidades principales](#capacidades-principales)
- [Requisitos](#requisitos)
- [Puesta en marcha local](#puesta-en-marcha-local)
- [Variables de entorno](#variables-de-entorno)
- [Scripts disponibles](#scripts-disponibles)
- [Ejecución y endpoints base](#ejecución-y-endpoints-base)
- [Módulos funcionales](#módulos-funcionales)
- [Autenticación y autorización](#autenticación-y-autorización)
- [Planes y suscripciones](#planes-y-suscripciones)
- [Media y uploads](#media-y-uploads)
- [Contrato de respuestas](#contrato-de-respuestas)
- [Observabilidad y manejo de errores](#observabilidad-y-manejo-de-errores)
- [Pruebas y calidad](#pruebas-y-calidad)
- [Despliegue](#despliegue)
- [Notas importantes de implementación](#notas-importantes-de-implementación)
- [Licencia](#licencia)

## Resumen

Lúpulos API centraliza la lógica de negocio del ecosistema Lúpulos y hoy cubre los siguientes dominios:

- **Autenticación** local y con Google OAuth.
- **Gestión de usuarios** con perfiles públicos, seguimiento entre cuentas y administración de roles.
- **Catálogo social de cervezas** con likes y reseñas.
- **Publicaciones de comunidad** con comentarios, reacciones e imágenes o video.
- **Lugares cerveceros** con dirección estructurada, ratings y media.
- **Chat entre usuarios** y endpoint de descubrimiento asistido de cervezas y lugares.
- **Suscripciones** con planes `lupuloso`, `pro` y `explorer` integradas con Mercado Pago.

## Stack tecnológico

### Backend

- Node.js 20+
- Express 4
- MongoDB + Mongoose
- Joi para validación de entrada
- Passport + Google OAuth 2.0
- JWT + refresh tokens con revocación
- Multer para manejo de archivos
- Winston + rotación diaria de logs
- Swagger UI para documentación interactiva

### Integraciones

- Google OAuth
- Mercado Pago PreApproval para suscripciones

### Tooling

- Nodemon para desarrollo local
- ESLint para linting
- Scripts de testing disponibles vía `npm test` y `npm test:ci`

## Arquitectura del proyecto

```text
lupulos-api/
├── README.md
├── package.json
├── package-lock.json
├── nodemon.json
├── deploy.sh
├── src/
│   ├── app.js
│   ├── config/
│   │   ├── index.js
│   │   ├── db.js
│   │   ├── passport.js
│   │   ├── permissions.js
│   │   ├── plans.js
│   │   ├── swagger.js
│   │   └── upload.js
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── utils/
├── public/
│   └── uploads/
└── tests/
```

### Organización por capas

- `src/routes`: define el contrato HTTP.
- `src/controllers`: orquesta reglas de negocio y respuestas.
- `src/models`: estructura persistente en MongoDB.
- `src/config`: configuración, seguridad, planes, permisos e integraciones.
- `src/utils`: helpers transversales como JWT, logging y respuestas.
- `src/services`: encapsula integraciones externas, por ejemplo Mercado Pago.

## Capacidades principales

- Autenticación con **access token** y **refresh token**.
- Revocación explícita de tokens al hacer logout.
- Perfil de usuario editable con imagen de perfil y preferencias.
- Google OAuth opcional, activado solo si el entorno provee credenciales válidas.
- Permisos por rol: `owner`, `admin`, `moderator`, `user`.
- Permisos personalizados por usuario (`customPermissions`).
- Planes de suscripción con límites y features por nivel.
- Upload de media local en `public/uploads`.
- Documentación navegable en Swagger.
- Endpoint de salud listo para monitoreo.
- Logging a archivo con rotación diaria y consola en desarrollo.
- Validación de body, params y query strings con Joi.
- Rate limiting en rutas sensibles.

## Requisitos

- **Node.js** `>= 20.0.0`
- **npm** `>= 9.0.0`
- **MongoDB** accesible desde la aplicación
- Credenciales opcionales si deseas habilitar:
  - Google OAuth
  - Mercado Pago

## Puesta en marcha local

### 1. Clonar el repositorio

```bash
git clone <repo-url>
cd lupulos-api
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Crear archivo de entorno

Para desarrollo local, la forma recomendada es crear `.env.local` en la raíz del proyecto.

Ejemplo mínimo:

```env
NODE_ENV=development
PORT=3940
MONGO_URI=mongodb://localhost:27017/lupulos_local

JWT_SECRET=tu_access_secret
REFRESH_SECRET=tu_refresh_secret
SESSION_SECRET=tu_session_secret

FRONTEND_URL=http://localhost:3000
```

### 4. Levantar el servidor

```bash
npm run dev
```

La aplicación quedará disponible por defecto en:

- API local: `http://localhost:3940`
- Swagger: `http://localhost:3940/api/documentacion`
- Healthcheck HTTP: `http://localhost:3940/health`

## Variables de entorno

La configuración carga primero `.env` y luego usa `.env.local` o `.env.prod` como archivo de apoyo según `NODE_ENV`. En la práctica, la prioridad útil es:

1. variables del sistema / shell
2. `.env`
3. `.env.local` o `.env.prod` para completar faltantes

### Variables principales

| Variable | Requerida | Descripción |
| --- | --- | --- |
| `NODE_ENV` | No | `development` o `production`. |
| `PORT` | No | Puerto HTTP/HTTPS. Default: `3940`. |
| `MONGO_URI` | Sí en producción | URI de MongoDB. En desarrollo cae a `mongodb://localhost:27017/lupulos_local`; en producción (`NODE_ENV=production`) es obligatoria y el arranque falla si falta. |
| `JWT_SECRET` | Sí | Secreto para access tokens. |
| `REFRESH_SECRET` | Sí | Secreto para refresh tokens. También acepta fallback desde `JWT_REFRESH_SECRET`. |
| `SESSION_SECRET` | Sí | Secreto para sesión Express. También acepta fallback desde `EXPRESS_SESSION_SECRET` o `JWT_SECRET`. |
| `FRONTEND_URL` | No | URL del frontend. Default: `https://lupulos.app`. |
| `TRUST_PROXY` | No | Controla `app.set('trust proxy')`. |
| `CORS_ORIGINS` | No | Lista CSV de orígenes adicionales permitidos, sumados a `FRONTEND_URL` y `http://localhost:3000`. |
| `BODY_LIMIT` | No | Límite de JSON body. Default: `1mb`. |
| `URLENCODED_LIMIT` | No | Límite para `application/x-www-form-urlencoded`. Default: `1mb`. |
| `JWT_EXPIRATION` | No | Expiración del access token. Default: `15m`. |
| `REFRESH_EXPIRATION` | No | Expiración del refresh token. Default: `7d`. |

### Google OAuth

| Variable | Requerida | Descripción |
| --- | --- | --- |
| `GOOGLE_CLIENT_ID` | Opcional | Habilita login con Google si está presente junto al secret. |
| `GOOGLE_CLIENT_SECRET` | Opcional | Secret de la app OAuth. |
| `GOOGLE_CALLBACK_URL` | Opcional | Callback personalizado. Por defecto apunta a `/api/auth/google/callback`. |

### Mercado Pago

| Variable | Requerida | Descripción |
| --- | --- | --- |
| `MERCADOPAGO_ACCESS_TOKEN` | Opcional | Necesaria para crear suscripciones reales. |
| `MERCADOPAGO_WEBHOOK_SECRET` | Sí si MP está habilitado en producción | Verifica la firma `x-signature` del webhook (HMAC-SHA256). En producción, sin secreto configurado o con firma inválida, el webhook responde `401`. |
| `MERCADOPAGO_BACK_URL` | Opcional | URL de retorno del flujo de pago. Por defecto usa `${FRONTEND_URL}/planes`. |

### Transporte y arranque

| Variable | Requerida | Descripción |
| --- | --- | --- |
| `FORCE_HTTP` | No | Fuerza HTTP incluso en producción. |
| `FORCE_HTTPS` | No | Fuerza HTTPS si existen `certs/key.pem` y `certs/cert.pem`. |

## Scripts disponibles

| Script | Descripción |
| --- | --- |
| `npm run dev` | Arranque local con Nodemon y `.env.local`. |
| `npm start` | Inicia la API en modo estándar. |
| `npm run start:prod` | Arranca en modo producción. |
| `npm run lint` | Ejecuta ESLint sobre `src`. |
| `npm run lint:fix` | Corrige automáticamente problemas de linting cuando es posible. |
| `npm test` | Ejecuta la suite configurada de pruebas. |
| `npm run test:watch` | Ejecuta pruebas en modo watch. |
| `npm run test:ci` | Variante para CI. |
| `npm run build` | Placeholder, no existe paso de build para esta API. |
| `npm run healthcheck` | Retorna `OK` por consola. |
| `npm run seed:demo` | Carga datos demo usando `.env.local`. |

## Ejecución y endpoints base

### Base path

Todas las rutas de negocio cuelgan del prefijo:

```text
/api
```

### Endpoints transversales

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/health` | Salud del servicio, uptime, nombre de servicio y estado de conexión a MongoDB. Responde `503` si la DB está desconectada. |
| `GET` | `/api/documentacion` | Swagger UI. |
| `GET` | `/uploads/*` | Archivos públicos subidos por la aplicación. |

### Ambientes declarados en Swagger

- Local: `http://localhost:3940`
- Producción: `https://api.lupulosapp.com`

## Módulos funcionales

### 1. Autenticación

Prefijo: `/api/auth`

Responsabilidades:

- Registro local
- Login local
- Refresh de access token
- Logout con invalidación de tokens
- Perfil autenticado
- Upload de imagen de perfil
- Inicio de flujo OAuth con Google

Rutas destacadas:

| Método | Ruta | Descripción |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Registro de usuario local. |
| `POST` | `/api/auth/login` | Login con email y contraseña. |
| `POST` | `/api/auth/logout` | Revoca tokens y cierra sesión lógica. |
| `POST` | `/api/auth/refresh-token` | Emite un nuevo access token. |
| `GET` | `/api/auth/profile/:userId` | Obtiene perfil autenticado. |
| `PUT` | `/api/auth/profile/:id` | Actualiza perfil. |
| `POST` | `/api/auth/upload/profile` | Sube foto de perfil. |
| `GET` | `/api/auth/google` | Inicia OAuth con Google. |
| `GET` | `/api/auth/google/callback` | Callback de Google. |

### 2. Usuarios y administración

Prefijo: `/api/user`

Responsabilidades:

- Consulta de usuario actual o listado público
- Perfil público por ID
- Edición de perfil
- Follow/unfollow
- Accesos administrativos por permisos

Rutas destacadas:

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/api/user` | Perfil actual o listado público según query. |
| `GET` | `/api/user/:id` | Perfil público de usuario. |
| `PUT` | `/api/user/:id` | Actualiza perfil propio o administrado. |
| `POST` | `/api/user/:id/follow` | Seguir usuario. |
| `POST` | `/api/user/:id/unfollow` | Dejar de seguir usuario. |
| `DELETE` | `/api/user/admin/:id` | Eliminación administrativa hard-delete. |
| `PATCH` | `/api/user/admin/:id/role` | Cambio de rol. |
| `PATCH` | `/api/user/admin/:id/permissions` | Permisos custom. |
| `GET` | `/api/user/admin/dashboard` | Endpoint de validación de acceso admin. |

### 3. Seguidores

Prefijo: `/api/follow`

Rutas destacadas:

| Método | Ruta | Descripción |
| --- | --- | --- |
| `POST` | `/api/follow/:id/follow` | Seguir usuario. |
| `POST` | `/api/follow/:id/unfollow` | Dejar de seguir usuario. |
| `GET` | `/api/follow/:id/followers` | Listado de seguidores. |
| `GET` | `/api/follow/:id/following` | Listado de seguidos. |

### 4. Publicaciones

Prefijo: `/api/post`

Responsabilidades:

- Crear y listar publicaciones
- Feed “muro vikingo”
- Upload de media para posts
- Reacciones
- Comentarios
- Paginación

Rutas destacadas:

| Método | Ruta | Descripción |
| --- | --- | --- |
| `POST` | `/api/post/upload` | Sube imagen o video para post. |
| `GET` | `/api/post` | Lista paginada de posts. |
| `GET` | `/api/post/muro-vikingo` | Feed específico de comunidad. |
| `POST` | `/api/post` | Crea post. |
| `GET` | `/api/post/:id` | Obtiene detalle de post. |
| `PUT` | `/api/post/:id` | Actualiza post propio. |
| `DELETE` | `/api/post/:id` | Elimina post propio. |
| `POST` | `/api/post/:id/react` | Reacciona al post. |
| `POST` | `/api/post/:postId/comments` | Agrega comentario. |
| `GET` | `/api/post/:postId/comments` | Lista comentarios del post. |

### 5. Cervezas

Prefijo: `/api/beer`

Responsabilidades:

- Catálogo de cervezas
- Búsqueda por nombre, estilo, cervecería y ABV
- Top rated y más nuevas
- Likes
- Reviews

Rutas destacadas:

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/api/beer` | Lista todas las cervezas. |
| `GET` | `/api/beer/search` | Búsqueda avanzada. |
| `GET` | `/api/beer/top-rated` | Top 10 por rating. |
| `GET` | `/api/beer/new` | Últimas 10 cervezas. |
| `GET` | `/api/beer/:id` | Detalle. |
| `POST` | `/api/beer` | Crea cerveza con imagen opcional. |
| `PUT` | `/api/beer/:id` | Actualiza cerveza propia. |
| `DELETE` | `/api/beer/:id` | Elimina cerveza propia. |
| `POST` | `/api/beer/:id/toggle-like` | Like/unlike. |
| `POST` | `/api/beer/:id/review` | Agrega review. |

### 6. Lugares

Prefijo: `/api/places`

Alias retrocompatible:

```text
/api/location
```

Responsabilidades:

- CRUD de lugares cerveceros
- Alta masiva
- Búsqueda
- Reviews
- Lugares cercanos y top rated
- Imagen de portada

Rutas destacadas:

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/api/places` | Lista lugares. |
| `GET` | `/api/places/top-rated` | Top 5 por rating. |
| `GET` | `/api/places/search?q=` | Búsqueda textual. |
| `GET` | `/api/places/nearby` | Búsqueda de cercanía. |
| `GET` | `/api/places/:id` | Detalle de lugar. |
| `POST` | `/api/places` | Crea lugar. |
| `POST` | `/api/places/bulk` | Crea lugares en lote. |
| `PATCH` | `/api/places/:id` | Actualiza lugar propio. |
| `DELETE` | `/api/places/:id` | Elimina lugar propio. |
| `POST` | `/api/places/:id/reviews` | Agrega review. |
| `POST` | `/api/places/:id/image` | Sube imagen principal. |

### 7. Chat

Prefijo: `/api/chat`

Responsabilidades:

- Crear o recuperar chat uno a uno
- Enviar mensajes
- Listar chats del usuario
- Obtener historial por chat
- Endpoint de descubrimiento “AI assistant” basado en búsqueda interna

Rutas destacadas:

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/api/chat` | Lista chats del usuario autenticado. |
| `GET` | `/api/chat/messages/:chatId` | Lista mensajes de un chat. |
| `POST` | `/api/chat/direct` | Crea o reutiliza chat directo. |
| `POST` | `/api/chat/:chatId/messages` | Envía mensaje. |
| `POST` | `/api/chat/ai/query` | Sugerencias sobre cervezas y lugares usando búsqueda interna. |

### 8. Suscripciones

Prefijo: `/api/subscription`

Responsabilidades:

- Catálogo de planes
- Consulta de suscripción actual
- Inicio de flujo de pago en Mercado Pago
- Cancelación
- Webhook de sincronización
- Grant manual por admin

Rutas destacadas:

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/api/subscription/plans` | Lista planes disponibles. |
| `GET` | `/api/subscription/me` | Estado de suscripción del usuario actual. |
| `POST` | `/api/subscription/subscribe` | Crea suscripción pendiente y retorna `paymentUrl`. |
| `POST` | `/api/subscription/cancel` | Cancela suscripción activa. |
| `POST` | `/api/subscription/webhook` | Recibe eventos de Mercado Pago. |
| `POST` | `/api/subscription/admin/grant` | Otorga plan manualmente. |
| `GET` | `/api/subscription/admin/user/:userId` | Consulta suscripciones de un usuario. |

## Autenticación y autorización

### JWT y Sesiones

La API utiliza un esquema híbrido de tokens y cookies de sesión para la autenticación:

- **Access Token (JWT):** Utilizado para autorizar peticiones HTTP mediante el encabezado `Authorization: Bearer <token>`. Su duración por defecto es de **2 horas** (configurable mediante la variable de entorno `JWT_EXPIRATION`).
- **Refresh Token (JWT):** Utilizado para renovar el access token de manera segura sin necesidad de volver a solicitar credenciales. Expira en **7 días** (configurable mediante la variable de entorno `REFRESH_EXPIRATION`).
- **Session Cookie (`lupulos.sid`):** Utilizada por Express Session y Passport (por ejemplo, en el flujo de Google OAuth). Está configurada con una expiración de **2 horas** (`maxAge: 7200000 ms`), asegurando la persistencia de sesión segura en el navegador.

#### Flujo esperado:

1. `POST /api/auth/register` o `POST /api/auth/login`.
2. Almacenar el `accessToken` y `refreshToken` en el cliente.
3. Enviar el `accessToken` en cada solicitud a rutas protegidas.
4. Utilizar `POST /api/auth/refresh-token` para obtener un nuevo access token antes de que expire.
5. Ejecutar `POST /api/auth/logout` para invalidar y revocar los tokens en la base de datos.

### Roles

Roles soportados:

- `owner`
- `admin`
- `moderator`
- `user`

El sistema combina:

- permisos por rol
- permisos custom por usuario
- reglas por plan de suscripción

### Seguridad aplicada

- Validación de payloads con Joi
- Revocación de tokens
- Rate limiting en auth y escritura de lugares
- Protección de rutas con middleware de autenticación
- Distinción por proveedor (`local`, `google`)

## Planes y suscripciones

La API define cuatro niveles:

| Plan | Mensual | Anual | Resumen |
| --- | --- | --- | --- |
| `free` | CLP `0` | CLP `0` | Lectura, chat y creación limitada. |
| `lupuloso` | CLP `2.000` | CLP `20.000` | Lugares, perfil custom y mayor actividad mensual. |
| `pro` | CLP `6.000` | CLP `60.000` | Recursos ilimitados, analytics, video y contenido premium. |
| `explorer` | CLP `9.000` | CLP `85.000` | Todo lo anterior más beta, eventos y feedback team. |

Características del flujo:

- La suscripción se crea localmente en estado `pending`.
- Luego se genera una **PreApproval** en Mercado Pago.
- El endpoint retorna una `paymentUrl` para completar el pago.
- El webhook sincroniza estados y activa la suscripción cuando corresponde.

## Media y uploads

Los archivos se almacenan localmente en:

```text
public/uploads
```

Subcarpetas operativas:

- `profiles`
- `posts`
- `beers`
- `places`

### Restricciones actuales

| Módulo | Tipo | Límite |
| --- | --- | --- |
| Perfil | Imágenes | 5 MB |
| Cervezas | Imágenes | 8 MB |
| Lugares | Imágenes | 8 MB |
| Posts | Imágenes o video | 250 MB |

Notas relevantes:

- Los nombres de archivo son saneados automáticamente.
- En posts se detecta tipo de media y, si es video, se intenta leer su duración.
- El video de post tiene tope lógico de **12 minutos**.

## Contrato de respuestas

La API usa un envelope consistente.

### Respuesta exitosa

```json
{
  "success": true,
  "message": "Request completed successfully",
  "data": {},
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

### Respuesta de error

```json
{
  "success": false,
  "message": "Invalid or expired token",
  "data": {},
  "errors": []
}
```

## Observabilidad y manejo de errores

### Logs

La aplicación registra:

- consola colorizada en desarrollo
- archivo rotado diario en `logs/app-%DATE%.log`
- archivo de errores dedicado en `logs/errors.log`

### Error handling

Existe un middleware global que:

- captura errores no controlados
- normaliza el código HTTP
- devuelve payload homogéneo

### Healthcheck

`GET /health` devuelve:

- estado del servicio
- nombre del servicio
- uptime
- timestamp

## Pruebas y calidad

El repositorio incluye scripts de calidad y una base inicial de pruebas automatizadas.

Comandos recomendados:

```bash
npm run lint
npm test
npm run test:ci
```

Estado actual:

- existe una base de pruebas en `tests/`
- la cobertura aún es acotada y debe ampliarse para controladores, integraciones y flujos de suscripción

## Despliegue

El proyecto incluye un script `deploy.sh` pensado para un despliegue tradicional con PM2.

### Comportamiento del script

- asume instalación en `/var/www/lupulos-api`
- espera archivo `.env` en la raíz
- instala dependencias productivas
- reinicia o crea el proceso PM2 llamado `lupulos-api`

### Ejemplo de despliegue

```bash
chmod +x deploy.sh
./deploy.sh
```

### HTTPS

El servidor puede levantar HTTPS cuando se cumple lo siguiente:

- `NODE_ENV=production` o `FORCE_HTTPS=true`
- existen los archivos:
  - `certs/key.pem`
  - `certs/cert.pem`

Si esas condiciones no se cumplen, el servicio arranca por HTTP.

## Notas importantes de implementación

### 1. CORS

La configuración actual limita orígenes efectivos a:

- `FRONTEND_URL`
- `http://localhost:3000`

Si necesitas abrir más orígenes, revisa la lógica en `src/config/index.js`.

### 2. WebSocket / Socket.IO

El repositorio conserva un módulo legacy en `src/config/sockets.js`, pero el arranque principal actual en `src/app.js` **no lo inicializa**. El flujo soportado oficialmente hoy para chat es el expuesto por las rutas HTTP.

### 3. Script de deploy y secretos

`deploy.sh` valida `JWT_SECRET` y `JWT_REFRESH_SECRET`. La aplicación principal también acepta `REFRESH_SECRET`. En producción conviene definir ambos o unificar el script antes de automatizar el despliegue.

### 4. Webhook de Mercado Pago

La variable `MERCADOPAGO_WEBHOOK_SECRET` existe en la configuración, pero la verificación criptográfica del webhook todavía no está endurecida en el controlador actual. Si el proyecto pasa a producción abierta, este punto debería reforzarse.

### 5. Eliminación administrativa de usuarios

La operación administrativa implementada actualmente es **hard-delete** y además limpia datos asociados del usuario. No debe documentarse ni asumirse como soft-delete.

## Licencia

Proyecto bajo licencia **MIT**.

## Autor

**Ignacio Sergio Díaz**

Si este repositorio se usa como base productiva, se recomienda complementar este documento con:

- política de versionado
- changelog
- guía de contribución
- estrategia de backups
- pipeline CI/CD
