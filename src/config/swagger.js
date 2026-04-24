import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import config from './index.js';

const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "🍺 Lúpulos App API",
            version: "1.0.0",
            description: "API para la comunidad de cervezas artesanales chilenas.",
            contact: {
                name: "Lúpulos App",
                email: "soporte@lupulosapp.com",
                url: "https://lupulosapp.com"
            },
        },
        servers: [
            {
                url: `http://localhost:${config.server.port}`,
                description: "Servidor local",
            },
            {
                url: "https://api.lupulosapp.com",
                description: "Servidor de producción",
            }
        ],
    },
    apis: ["./src/routes/*.js"], // 📌 Aquí Swagger buscará las rutas documentadas
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);

export function setupSwagger(app) {
    app.use('/api/documentacion', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
    console.log("📖 Documentación de Swagger disponible en: /api/documentacion");
}
