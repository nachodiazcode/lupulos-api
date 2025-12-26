import express from 'express';
import cors from 'cors';
import logger from './utils/logger.js';
import config from './config/config.js';
import { connectDB } from './config/db.js';
import { setupSwagger } from './config/swagger.js';
import session from 'express-session';
import passport from 'passport';
import './config/passport.js'; // 👈 Importa la estrategia Google

import routes from './routes/index.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🚀 Crear app
const app = express();

// 🌍 Conexión a DB
connectDB();

// 📦 Middlewares esenciales
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🛡️ Configurar sesión y passport
app.use(session({
  secret: process.env.JWT_SECRET || "supersecreto",
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize());
app.use(passport.session());

// 📂 Servir archivos públicos
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'lupulos-app-api',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});


// 📜 Logs básicos
app.use((req, res, next) => {
  console.log(`Recibiendo petición: ${req.method} ${req.originalUrl}`);
  logger.info(`[Petición] ${req.method} ${req.originalUrl}`);
  next();
});

// 📚 Swagger (opcional)
setupSwagger(app);

// 📍 Rutas
app.use('/api', routes);

import userRoutes from "./routes/userRoutes.js";
app.use("/api/user", userRoutes);


// 🌐 Página de bienvenida
app.get('/', (req, res) => {
  logger.info(`Página de bienvenida accedida desde ${req.ip}`);
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;700&display=swap" rel="stylesheet" />
      <script src="https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js"></script>
      <title>Lúpulos App API</title>
      <style>
        body, html { height: 100%; margin: 0; font-family: 'Roboto', sans-serif; background: #333; color: white; }
        #particles-js { position: absolute; width: 100%; height: 100%; background: linear-gradient(to right, #ff9900, #ffcc33); }
        .container { position: relative; z-index: 2; display: flex; justify-content: center; align-items: center; height: 100vh; text-align: center; }
        h1 { font-size: 3rem; color: #ffb400; }
        p { font-size: 1.4rem; line-height: 1.6; }
        a { color: #ffb400; background-color: transparent; padding: 12px 24px; border: 2px solid #ffb400; border-radius: 5px; text-decoration: none; font-weight: bold; transition: background-color 0.3s, color 0.3s, transform 0.3s; }
        a:hover { background-color: #ffb400; color: #333; transform: translateY(-5px); }
      </style>
    </head>
    <body>
      <div id="particles-js"></div>
      <div class="container">
        <h1>¡Bienvenido a Lúpulos App API!</h1>
        <p>Descubre y comparte las mejores cervezas artesanales chilenas.</p>
        <a href="/api/documentacion" target="_blank">Explorar Documentación</a>
      </div>
      <script>
        particlesJS.load('particles-js', 'particles.json', function() {
          console.log('callback - particles.js config loaded');
        });
      </script>
    </body>
    </html>
  `);
});

// 🔥 Iniciar servidor
const PORT = config.port || 3940;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  logger.info(`Servidor iniciado en el puerto ${PORT}`);
});
