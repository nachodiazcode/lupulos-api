const prodConfig = {
    server: {
        trustProxy: true,
    },

    database: {
        uri: process.env.MONGO_URI,
    },

    jwt: {
        accessSecret: process.env.JWT_SECRET,
        accessExpiration: '15m',
        refreshSecret: process.env.REFRESH_SECRET,
        refreshExpiration: '7d',
    },

    oauth: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackUrl: process.env.GOOGLE_CALLBACK_URL,
        },
    },

    frontend: {
        url: process.env.FRONTEND_URL,
    },

    mercadopago: {
        accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
        webhookSecret: process.env.MERCADOPAGO_WEBHOOK_SECRET,
        backUrl: process.env.MERCADOPAGO_BACK_URL || 'https://lupulos.app/planes',
    },
};

export default prodConfig;
