// Función para obtener chats de un usuario
export const getUserChats = async (req, res) => {
    try {
        const chats = await Chat.find({ users: req.params.userId })
            .populate('users', 'username email');
        res.json(chats);
    } catch (error) {
        res.status(500).json({ message: 'Error obteniendo los chats' });
    }
};

// Función para obtener los mensajes de un chat
export const getChatMessages = async (req, res) => {
    try {
        const messages = await Message.find({ chatId: req.params.chatId })
            .sort({ createdAt: 1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Error obteniendo los mensajes' });
    }
};
