import Message from '../models/Message.js';
import Chat from '../models/Chat.js';

// Crear nuevo mensaje
export const createMessage = async (req, res) => {
  const { chatId, sender, text, media, mediaType } = req.body;

  try {
    const message = await Message.create({
      chatId,
      sender,
      text,
      media: media ? { url: media, type: mediaType } : undefined,
    });

    await Chat.findByIdAndUpdate(chatId, { lastMessage: message._id });

    const populated = await message.populate('sender', 'username fotoPerfil');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear mensaje', error });
  }
};

// Editar mensaje
export const updateMessage = async (req, res) => {
  const { messageId } = req.params;
  const { newText } = req.body;

  try {
    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: 'Mensaje no encontrado' });

    message.editHistory.push({ previousText: message.text });
    message.text = newText;
    message.edited = true;
    await message.save();

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: 'Error al editar mensaje' });
  }
};

// Eliminar mensaje (borrado lógico)
export const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ message: 'Mensaje no encontrado' });

    message.isDeleted = true;
    message.text = '';
    await message.save();

    res.json({ message: 'Mensaje eliminado (soft delete)' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar mensaje' });
  }
};

// Dar like a un mensaje
export const likeMessage = async (req, res) => {
  const { userId } = req.body;

  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ message: 'Mensaje no encontrado' });

    if (!message.likes.includes(userId)) {
      message.likes.push(userId);
      await message.save();
    }

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: 'Error al dar like' });
  }
};

// Reaccionar con emoji a un mensaje
export const reactToMessage = async (req, res) => {
  const { emoji, userId } = req.body;

  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) return res.status(404).json({ message: 'Mensaje no encontrado' });

    message.reactions.push({ emoji, user: userId });
    await message.save();

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: 'Error al reaccionar al mensaje' });
  }
};
