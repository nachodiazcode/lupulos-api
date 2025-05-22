## Lúpulos App - API

Lúpulos App es una API desarrollada en **Node.js** con **Express y MongoDB**, diseñada para gestionar una comunidad de amantes de la **cerveza artesanal**.  

Esta API permite a los usuarios **compartir opiniones, subir imágenes y descubrir nuevas cervezas**, además de interactuar en **publicaciones, comentarios y chats en tiempo real**.

---

## 🚀 Características Principales

- ✅ **Autenticación de usuarios con JWT y Refresh Token**  
- ✅ **Creación y gestión de cervezas con imágenes**  
- ✅ **Publicaciones y comentarios en posts**  
- ✅ **Sistema de seguidores y comunidad**  
- ✅ **Soft Delete y recuperación de usuarios eliminados**  
- ✅ **Chat en tiempo real con WebSockets**  
- ✅ **Cerveza del Día seleccionada automáticamente**  
- ✅ **Documentación con Swagger**  
- ✅ **Pruebas unitarias con Jest**  
- ✅ **Métricas de rendimiento con Prometheus**  
- ✅ **Registro de logs con Winston**  

---

## 📂 Estructura del Proyecto

```
package-lock.json
├── package.json
├── server.js
├── src
│   ├── app.js
│   ├── config
│   │   ├── config.js       # Configuración general
│   │   ├── db.js           # Conexión a MongoDB
│   │   └── swagger.js      # Configuración de Swagger
│   ├── controllers
│   │   ├── authController.js   # Lógica de autenticación
│   │   ├── beerController.js   # Controlador de cervezas
│   │   ├── followController.js # Controlador de seguidores
│   │   ├── postController.js   # Controlador de publicaciones
│   │   ├── chatController.js   # Controlador del chat
│   │   ├── notificationController.js # Notificaciones (pendiente)
│   │   └── userController.js   # Controlador de usuarios con Soft Delete
│   ├── middlewares
│   │   ├── authMiddleware.js   # Middleware de autenticación
│   │   ├── rateLimit.js        # Middleware de limitación de peticiones
│   │   └── errorHandler.js      # Middleware global de manejo de errores
│   ├── models
│   │   ├── Beer.js           # Modelo de cerveza
│   │   ├── Comment.js        # Modelo de comentarios
│   │   ├── Message.js        # Modelo de mensajes del chat
│   │   ├── Notifications.js  # Modelo de notificaciones
│   │   ├── Post.js           # Modelo de publicaciones
│   │   └── User.js           # Modelo de usuarios con Soft Delete
│   ├── routes
│   │   ├── authRoutes.js     # Rutas de autenticación
│   │   ├── beerRoutes.js     # Rutas de cervezas
│   │   ├── followRoutes.js   # Rutas de seguidores
│   │   ├── postRoutes.js     # Rutas de publicaciones
│   │   ├── chatRoutes.js     # Rutas del chat en tiempo real
│   │   ├── userRoutes.js     # Rutas de usuarios con Soft Delete
│   │   └── notificationRoutes.js # Rutas de notificaciones (pendiente)
│   ├── services
│   │   ├── authService.js    # Lógica de autenticación
│   │   ├── beerService.js    # Lógica de cervezas
│   │   ├── chatService.js    # Lógica del chat
│   │   └── notificationService.js # Notificaciones (pendiente)
│   ├── utils
│   │   ├── logger.js         # Registro de logs con Winston
│   │   ├── metrics.js        # Monitoreo con Prometheus
│   │   └── helper.js         # Funciones auxiliares
└── tests
    ├── auth.test.js          # Pruebas de autenticación
    ├── beer.test.js          # Pruebas de cervezas
    ├── chat.test.js          # Pruebas del chat en tiempo real
    ├── user.test.js          # Pruebas de usuarios con Soft Delete
```

---

## 🛠️ Instalación y Configuración

### 1️⃣ Clonar el repositorio
```bash
git clone https://github.com/tu_usuario/lupulos-app.git
cd lupulos-app
```
### 2️⃣ Instalar dependencias
```bash
npm install
```
### 3️⃣ Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto y agrega:
```env
PORT=3940
MONGO_URI=mongodb://localhost:27017/lupulos
JWT_SECRET=tu_clave_secreta
REFRESH_SECRET=otra_clave_secreta
```
### 4️⃣ Iniciar el servidor
```bash
npm start
```
El servidor correrá en `http://localhost:3940`

---

## 📉 Mejoras Pendientes
- [ ] Implementar notificaciones en tiempo real
- [ ] Seguridad avanzada con sanitización de datos
- [ ] Ampliar cobertura de pruebas
- [ ] Mejorar escalabilidad con Docker y Kubernetes

---

📢 **Contribuciones**: Haz un fork y envía un PR.
🚀 ¡Gracias por contribuir a Lúpulos App! 🍻

