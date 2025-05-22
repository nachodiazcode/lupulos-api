import User from "../models/User.js";

// ✅ Obtener la lista de seguidores
export const getFollowers = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).populate("followers", "username email fotoPerfil");

    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    res.json(user.followers);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo seguidores", error: error.message });
  }
};

// ✅ Obtener a quién sigue un usuario
export const getFollowing = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).populate("following", "username email fotoPerfil");

    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    res.json(user.following);
  } catch (error) {
    res.status(500).json({ message: "Error obteniendo seguidos", error: error.message });
  }
};

// ✅ Seguir a un usuario
export const followUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const targetId = req.params.id;

    if (userId === targetId) {
      return res.status(400).json({ message: "No puedes seguirte a ti mismo" });
    }

    const user = await User.findById(userId);
    const targetUser = await User.findById(targetId);

    if (!user || !targetUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const yaSigue = user.following.includes(targetId);
    if (yaSigue) {
      return res.status(400).json({ message: "Ya sigues a este usuario" });
    }

    // Evitar usar .save() que dispara validaciones innecesarias
    await User.findByIdAndUpdate(userId, { $addToSet: { following: targetId } });
    await User.findByIdAndUpdate(targetId, { $addToSet: { followers: userId } });

    res.json({ message: "Ahora sigues a este usuario" });
  } catch (error) {
    console.error("❌ Error en followUser:", error);
    res.status(500).json({ message: "Error interno al seguir usuario", error: error.message });
  }
};

// ✅ Dejar de seguir
export const unfollowUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const targetId = req.params.id;

    const user = await User.findById(userId);
    const targetUser = await User.findById(targetId);

    if (!user || !targetUser) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    await User.findByIdAndUpdate(userId, { $pull: { following: targetId } });
    await User.findByIdAndUpdate(targetId, { $pull: { followers: userId } });

    res.json({ message: "Has dejado de seguir al usuario" });
  } catch (error) {
    console.error("❌ Error en unfollowUser:", error);
    res.status(500).json({ message: "Error al dejar de seguir", error: error.message });
  }
};
