export default {
  apps: [
    {
      name: "lupulos-api",
      script: "./src/app.js",
      cwd: "./", // directorio base del proyecto
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 3940,
        MONGO_URI: "mongodb://localhost:27017/lupulos", // cámbialo si usas el de DigitalOcean
        JWT_SECRET: "secreto_super_seguro",
        JWT_REFRESH_SECRET: "super_refresh_token_ultrasecreto",
        TOKEN_EXPIRATION: "15m",
        REFRESH_TOKEN_EXPIRATION: "30d",
        GOOGLE_CLIENT_ID: "tu_id_google",
        GOOGLE_CLIENT_SECRET: "tu_secreto_google",
        GOOGLE_CALLBACK_URL: "http://localhost:3940/api/auth/google/callback",
        LOG_LEVEL: "info"
      }
    }
  ]
}
