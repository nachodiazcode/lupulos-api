const { Server } = require('socket.io');

module.exports = function setupSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: "*", // Permitir cualquier origen (ajustar en producción)
        }
    });

    io.on('connection', (socket) => {
        console.log('Usuario conectado:', socket.id);

        // Unirse a un chat específico
        socket.on('joinChat', (chatId) => {
            socket.join(chatId);
            console.log(`Usuario ${socket.id} se unió al chat ${chatId}`);
        });

        // Escuchar mensajes
        socket.on('sendMessage', async ({ chatId, sender, message }) => {
            const newMessage = { chatId, sender, message, createdAt: new Date() };
            
            // Guardar en MongoDB
            const Message = require('../models/Message');
            await Message.create(newMessage);

            // Emitir a los usuarios en el chat
            io.to(chatId).emit('receiveMessage', newMessage);
        });

        // Desconexión
        socket.on('disconnect', () => {
            console.log('Usuario desconectado:', socket.id);
        });
    });

    return io;
};
