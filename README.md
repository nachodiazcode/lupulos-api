# 🍺 Lúpulos App - API

**Lúpulos App** es una poderosa API REST desarrollada con **Node.js**, **Express** y **MongoDB**, creada especialmente para reunir a los fanáticos de la **cerveza artesanal** en una comunidad digital vibrante.

La plataforma permite a los usuarios **explorar cervezas, compartir opiniones, interactuar mediante publicaciones y comentarios**, y participar en un **chat en tiempo real**. Todo esto acompañado de un sistema robusto de autenticación, métricas, pruebas y documentación.

---

## 🚀 Funcionalidades Destacadas

- 🔐 **Autenticación con JWT y Refresh Tokens**
- 🍻 **Gestión de cervezas con imágenes y descripciones**
- 📝 **Publicaciones y comentarios interactivos**
- 👥 **Sistema de seguidores y comunidad**
- ♻️ **Eliminación lógica (Soft Delete) y recuperación de cuentas**
- 💬 **Chat en tiempo real usando WebSockets**
- 🌟 **Selección automática de la “Cerveza del Día”**
- 📚 **Documentación Swagger integrada**
- 🧪 **Pruebas unitarias con Jest**
- 📈 **Métricas Prometheus para monitoreo**
- 🧾 **Logs avanzados con Winston**

---

## 📁 Estructura del Proyecto (actualizada al 22 de mayo de 2025)

```
├── README.md
├── favicon.png
├── logs/
├── package.json
├── public/uploads/
│   ├── beers/
│   ├── locations/
│   ├── posts/
│   └── profile/
├── src/
│   ├── app.js
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── uploads/
│   └── utils/
├── tests/
```

---

## ⚙️ Instalación y Configuración

### 🔧 1. Clonar el repositorio

```bash
git clone https://github.com/tu_usuario/lupulos-app.git
cd lupulos-app
```

### 📦 2. Instalar dependencias

```bash
npm install
```

### 🔐 3. Configurar variables de entorno

Crea un archivo `.env` con lo siguiente:

```env
PORT=3940
MONGO_URI=mongodb://localhost:27017/lupulos
JWT_SECRET=tu_clave_secreta
REFRESH_SECRET=otra_clave_secreta
```

### ▶️ 4. Iniciar el servidor

```bash
npm start
```

Tu API estará disponible en `http://localhost:3940`

---

## 📉 Mejoras Pendientes

- [ ] Integrar sistema de notificaciones en tiempo real
- [ ] Agregar protección contra XSS, CSRF y sanitización
- [ ] Ampliar cobertura de pruebas unitarias
- [ ] Preparar el entorno para despliegue con Docker/Kubernetes

---

## 🤝 Contribuye con la Comunidad

¿Te gustaría aportar? Haz un fork, crea tu rama y envía un **Pull Request**.  
Cada línea de código cuenta para fortalecer esta comunidad cervecera 🍻

---

**Última actualización:** 22 de mayo de 2025  
**Autor:** Ignacio Díaz · [nachodiazcode.io](https://nachodiazcode.io)


## Cambios Package.json intengrando pm2  