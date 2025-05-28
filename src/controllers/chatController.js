import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

// Obtener los chats de un usuario
export const getUserChats = async (req, res) => {
    try {
        const chats = await Chat.find({
            users: req.params.userId,
            deletedFor: { $ne: req.params.userId },
        })
            .populate('users', 'username email fotoPerfil')
            .populate('lastMessage')
            .populate('admin', 'username')
            .sort({ updatedAt: -1 });

        res.json(chats);
    } catch (error) {
        res.status(500).json({ message: 'Error obteniendo los chats' });
    }
};

// Crear un nuevo chat o devolver uno existente
export const createChat = async (req, res) => {
    const { userIds, isGroupChat = false, chatName, adminId, image } = req.body;

    try {
        if (!isGroupChat && userIds.length === 2) {
            const existing = await Chat.findOne({
                isGroupChat: false,
                users: { $all: userIds, $size: 2 },
            });

            if (existing) return res.json(existing);
        }

        const chat = await Chat.create({
            users: userIds,
            isGroupChat,
            chatName,
            admin: adminId,
            image,
        });

        const fullChat = await Chat.findById(chat._id)
            .populate('users', 'username email fotoPerfil')
            .populate('admin', 'username');

        res.status(201).json(fullChat);
    } catch (error) {
        res.status(500).json({ message: 'Error creando el chat' });
    }
};

// Obtener los mensajes de un chat
export const getChatMessages = async (req, res) => {
    try {
        const messages = await Message.find({ chatId: req.params.chatId })
            .populate('sender', 'username fotoPerfil')
            .sort({ createdAt: 1 });

        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Error obteniendo los mensajes' });
    }
};

// Eliminar chat para un usuario (soft delete)
export const deleteChatForUser = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { userId } = req.body;

        const chat = await Chat.findById(chatId);
        if (!chat) return res.status(404).json({ message: 'Chat no encontrado' });

        if (!chat.deletedFor.includes(userId)) {
            chat.deletedFor.push(userId);
            await chat.save();
        }

        res.json({ message: 'Chat eliminado para este usuario' });
    } catch (error) {
        res.status(500).json({ message: 'Error eliminando el chat' });
    }
};

// Renombrar chat (guardar en historial)
export const renameChat = async (req, res) => {
    const { chatId } = req.params;
    const { newName, changedBy } = req.body;

    try {
        const chat = await Chat.findById(chatId);
        if (!chat) return res.status(404).json({ message: 'Chat no encontrado' });

        chat.nameHistory.push({ name: chat.chatName || '', changedBy });
        chat.chatName = newName;
        await chat.save();

        res.json(chat);
    } catch (error) {
        res.status(500).json({ message: 'Error renombrando el chat' });
    }
};

// Añadir usuario al chat
export const addUserToChat = async (req, res) => {
    const { chatId } = req.params;
    const { userId } = req.body;

    try {
        const chat = await Chat.findById(chatId);
        if (!chat) return res.status(404).json({ message: 'Chat no encontrado' });

        if (!chat.users.includes(userId)) {
            chat.users.push(userId);
            await chat.save();
        }

        res.json(chat);
    } catch (error) {
        res.status(500).json({ message: 'Error añadiendo usuario al chat' });
    }
};

// Quitar usuario del chat
export const removeUserFromChat = async (req, res) => {
    const { chatId } = req.params;
    const { userId } = req.body;

    try {
        const chat = await Chat.findById(chatId);
        if (!chat) return res.status(404).json({ message: 'Chat no encontrado' });

        chat.users = chat.users.filter(
            (id) => id.toString() !== userId.toString()
        );

        // Si el admin se fue, asignar nuevo admin
        if (chat.admin?.toString() === userId.toString() && chat.users.length > 0) {
            chat.admin = chat.users[0];
        }

        await chat.save();
        res.json(chat);
    } catch (error) {
        res.status(500).json({ message: 'Error removiendo usuario del chat' });
    }
};
