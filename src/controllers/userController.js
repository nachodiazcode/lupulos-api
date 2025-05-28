import User from '../models/User.js';
import mongoose from "mongoose";

// 📌 Obtener todos los usuarios
export const getUsers = async (req, res) => {
    try {
        const users = await User.find();
        if (!users.length) {
            return res.status(200).json({ message: "⚠️ No hay usuarios en la base de datos", users: [] });
        }
        res.json(users);
    } catch (error) {
        console.error("❌ Error en getUsers:", error);
        res.status(500).json({ message: "Error al obtener usuarios", error });
    }
};

// 📌 Obtener un usuario por ID
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.json(user);
    } catch (error) {
        console.error("❌ Error en getUserById:", error);
        res.status(500).json({ message: 'Error al obtener usuario', error });
    }
};

// 📌 Crear un nuevo usuario
export const createUser = async (req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(201).json({ message: '✅ Usuario creado exitosamente', data: newUser });
    } catch (error) {
        console.error("❌ Error en createUser:", error);
        res.status(500).json({ message: 'Error al crear usuario', error });
    }
};

// 📌 Actualizar usuario
export const updateUser = async (req, res) => {
    try {
        const allowedFields = ['username', 'email', 'bio', 'ciudad', 'pais', 'fotoPerfil', 'fotoBanner', 'estiloFavorito', 'perfilPublico'];
        const updates = {};

        for (let key of allowedFields) {
            if (req.body[key] !== undefined) {
                updates[key] = req.body[key];
            }
        }

        const updatedUser = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
        if (!updatedUser) return res.status(404).json({ message: 'Usuario no encontrado' });

        res.json({ message: '✅ Usuario actualizado', data: updatedUser });
    } catch (error) {
        console.error("❌ Error en updateUser:", error);
        res.status(500).json({ message: 'Error al actualizar usuario', error });
    }
};

// 📌 Eliminar usuario
export const deleteUser = async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) return res.status(404).json({ message: 'Usuario no encontrado' });

        res.json({ message: '✅ Usuario eliminado', data: deletedUser });
    } catch (error) {
        console.error("❌ Error en deleteUser:", error);
        res.status(500).json({ message: 'Error al eliminar usuario', error });
    }
};


// 👇 resto de funciones...
export const getPerfilPublico = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID inválido" });
        }

        
        const user = await User.findById(id).select("-password -refreshToken");
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

        res.status(200).json({ usuario: user });
    } catch (error) {
        console.error("❌ Error interno en getPerfilPublico:", error);
        res.status(500).json({ message: "Error al obtener perfil", error: error.message });
    }
};

export const getFollowingList = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('following', 'username fotoPerfil email');
    if (!user) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    res.json({ exito: true, usuarios: user.following });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener los usuarios seguidos' });
  }
};
