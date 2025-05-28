const { Server } = require('socket.io');
const Message = require('../models/Message'); // ✅ Requiere fuera de callbacks

module.exports = function setupSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: "*", // 🔒 En producción: poner frontend URL
        },
    });

    io.on('connection', (socket) => {
        console.log('🟢 Usuario conectado:', socket.id);

        // 🔸 Unirse a sala específica
        socket.on('joinChat', (chatId) => {
            if (!chatId) return;
            socket.join(chatId);
            console.log(`👥 Usuario ${socket.id} se unió al chat ${chatId}`);
        });

        // ✉️ Enviar mensaje
        socket.on('sendMessage', async ({ chatId, sender, message }) => {
            if (!chatId || !sender || !message) {
                return console.warn('⚠️ Datos incompletos en sendMessage');
            }

            const newMessage = {
                chatId,
                sender,
                message,
                createdAt: new Date().toISOString(),
            };

            try {
                await Message.create(newMessage);
                io.to(chatId).emit('receiveMessage', newMessage);
            } catch (err) {
                console.error('❌ Error guardando mensaje en DB:', err);
            }
        });

        // 🔌 Desconexión
        socket.on('disconnect', () => {
            console.log('🔴 Usuario desconectado:', socket.id);
        });
    });

    return io;
};
