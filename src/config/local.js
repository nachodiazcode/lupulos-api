const localConfig = {
    server: {
        port: process.env.PORT || 3940,
        trustProxy: false,
    },

    database: {
        uri: process.env.MONGO_URI || 'mongodb://localhost:27017/lupulos_local',
    },

    jwt: {
        accessSecret: process.env.JWT_SECRET || 'jwt_dev_secret',
        accessExpiration: '15m',
        refreshSecret: process.env.JWT_REFRESH_SECRET || 'refresh_dev_secret',
        refreshExpiration: '7d',
    },

    oauth: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
            callbackUrl:
                process.env.GOOGLE_CALLBACK_URL ||
            'http://localhost:3940/api/auth/google/callback',
        },
    },

    frontend: {
        url: process.env.FRONTEND_URL || 'http://localhost:3000',
    },

    mercadopago: {
        accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
        webhookSecret: process.env.MERCADOPAGO_WEBHOOK_SECRET || '',
        backUrl: process.env.MERCADOPAGO_BACK_URL || 'http://localhost:3000/planes',
    },
};

export default localConfig;
