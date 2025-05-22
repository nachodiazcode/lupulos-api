import User from "../models/User.js";
import bcrypt from "bcryptjs";
import Post from "../models/Post.js";
import Beer from "../models/Beer.js";
import Lugares from "../models/Locations.js";
import RevokedToken from "../models/RevokedToken.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import dotenv from "dotenv";
dotenv.config();

// 🟢 REGISTRO
export const registerUser = async (req, res) => {
  try {
    const { username, email, password, fotoPerfil } = req.body;

    if (!password || password.trim() === "") {
      return res.status(400).json({ exito: false, mensaje: "❌ La contraseña es obligatoria" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      fotoPerfil: fotoPerfil || "https://www.example.com/default-avatar.jpg",
    });

    await newUser.save();

    const accessToken = generateAccessToken(newUser._id);
    const refreshToken = generateRefreshToken(newUser._id);
    newUser.refreshToken = refreshToken;
    await newUser.save();

    res.status(201).json({
      exito: true,
      mensaje: "✅ Usuario registrado exitosamente",
      accessToken,
      refreshToken,
      usuario: buildUserResponse(newUser),
    });
  } catch (error) {
    console.error("❌ Error en registerUser:", error);
    res.status(500).json({ exito: false, mensaje: "❌ Error al registrar usuario", error: error.message });
  }
};

// 🟢 LOGIN LOCAL
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email })
      .populate("followers", "username fotoPerfil")
      .populate("following", "username fotoPerfil");

    if (!user) return res.status(401).json({ exito: false, mensaje: "❌ Usuario no encontrado" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ exito: false, mensaje: "❌ Contraseña incorrecta" });

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      exito: true,
      mensaje: "✅ Inicio de sesión exitoso",
      accessToken,
      refreshToken,
      usuario: buildUserResponse(user),
    });
  } catch (error) {
    console.error("❌ Error en loginUser:", error);
    res.status(500).json({ exito: false, mensaje: "❌ Error al iniciar sesión", error: error.message });
  }
};

// 🟢 LOGIN CON GOOGLE
export const loginWithGoogle = async (req, res) => {
  try {
    const usuario = req.user;

    const accessToken = generateAccessToken(usuario._id);
    const refreshToken = generateRefreshToken(usuario._id);

    usuario.refreshToken = refreshToken;
    await usuario.save();

    // Redirección al frontend con token y datos
    res.redirect(
      `http://localhost:3000/login-success?token=${accessToken}&email=${usuario.email}&username=${usuario.username}&userId=${usuario._id}`
    );
  } catch (error) {
    console.error("❌ Error en loginWithGoogle:", error);
    res.redirect("http://localhost:3000/auth/login");
  }
};

// 🟢 LOGOUT
export const logoutUser = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(400).json({ exito: false, mensaje: "No se encontró token" });

    const expiresAt = new Date(Date.now() + 3600 * 1000);
    await RevokedToken.create({ token, expiresAt });

    res.json({ exito: true, mensaje: "Cierre de sesión exitoso" });
  } catch (error) {
    console.error("❌ Error en logoutUser:", error);
    res.status(500).json({ exito: false, mensaje: "Error al cerrar sesión", error: error.message });
  }
};

// 🟢 REFRESH TOKEN
export const refreshToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(401).json({ exito: false, mensaje: "No se proporcionó refreshToken" });

    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== token) {
      return res.status(403).json({ exito: false, mensaje: "Refresh token inválido" });
    }

    const newAccessToken = generateAccessToken(user._id);
    res.json({ exito: true, accessToken: newAccessToken });
  } catch (error) {
    console.error("❌ Error en refreshToken:", error);
    res.status(500).json({ exito: false, mensaje: "Error al refrescar token", error: error.message });
  }
};

// 🟢 PERFIL DE USUARIO
export const getPerfilUsuario = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId)
      .select("username email fotoPerfil fotoBanner bio ciudad pais estiloFavorito followers following badges createdAt notasDeCata")
      .populate("followers", "username fotoPerfil")
      .populate("following", "username fotoPerfil");

    if (!user) return res.status(404).json({ exito: false, mensaje: "Usuario no encontrado" });

    const [posts, cervezas, lugares] = await Promise.all([
      Post.find({ usuario: userId }),
      Beer.find({ usuario: userId }),
      Lugares.find({ usuario: userId }), // ← AQUÍ EL CAMBIO CLAVE
    ]);
    

    const postsConReacciones = await Post.find({
      $or: [
        { "reacciones.salud.usuarios": userId },
        { "reacciones.recomendado.usuarios": userId },
        { "reacciones.meGusta.usuarios": userId },
      ],
    });

    const totalLikesHechos = postsConReacciones.length;

    res.json({
      exito: true,
      usuario: buildUserResponse(user),
      stats: {
        posts: posts.length,
        cervezas: cervezas.length,
        lugares: lugares.length,
        likes: totalLikesHechos,
        seguidores: user.followers.length,
        seguidos: user.following.length,
      },
      notasDeCata: user.notasDeCata || [],
    });
  } catch (error) {
    console.error("❌ Error en getPerfilUsuario:", error);
    res.status(500).json({ exito: false, mensaje: "Error interno del servidor", error: error.message });
  }
};

// 🟢 OLVIDÉ MI CONTRASEÑA
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ exito: false, mensaje: "Debes ingresar un correo" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ exito: false, mensaje: "Usuario no encontrado" });
    }

    // 🔐 Generar un token temporal (puedes usar JWT o un string aleatorio)
    // Acá dejamos uno simple de ejemplo con Date.now + user ID
    const resetToken = `${user._id}-${Date.now()}`;
    const resetExpires = Date.now() + 3600000; // 1 hora

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;
    await user.save();

    // ✉️ Aquí deberías enviar un email real (por ahora, solo devolvemos el token)
    res.json({
      exito: true,
      mensaje: "Te hemos enviado un enlace para restablecer tu contraseña",
      resetLink: `http://localhost:3000/auth/reset-password/${resetToken}`,
    });
  } catch (error) {
    console.error("❌ Error en forgotPassword:", error);
    res.status(500).json({
      exito: false,
      mensaje: "Error al procesar recuperación",
      error: error.message,
    });
  }
};

// 🟢 RESETEAR CONTRASEÑA
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ exito: false, mensaje: "La nueva contraseña debe tener al menos 6 caracteres" });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // token aún válido
    });

    if (!user) {
      return res.status(400).json({ exito: false, mensaje: "Token inválido o expirado" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.json({ exito: true, mensaje: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.error("❌ Error en resetPassword:", error);
    res.status(500).json({ exito: false, mensaje: "Error al restablecer contraseña", error: error.message });
  }
};

// 🟢 VERIFICAR CORREO (requiere que hayas enviado un token por email antes)
export const verifyEmail = async (req, res) => {
  const { token } = req.params;
  try {
    const decoded = jwt.verify(token, process.env.EMAIL_SECRET); // Asegúrate de tener esta variable en tu .env
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ exito: false, mensaje: "Usuario no encontrado" });
    }

    user.isVerified = true;
    await user.save();

    res.json({ exito: true, mensaje: "✅ Correo verificado correctamente" });
  } catch (error) {
    console.error("❌ Error en verifyEmail:", error);
    res.status(500).json({ exito: false, mensaje: "Error al verificar correo", error: error.message });
  }
};



// 🛠️ Función para armar respuesta de usuario
const buildUserResponse = (user) => ({
  _id: user._id,
  username: user.username,
  email: user.email,
  fotoPerfil: user.fotoPerfil,
  fotoBanner: user.fotoBanner || "",
  bio: user.bio || "Sin biografía 🍃",
  ciudad: user.ciudad || "No especificada",
  pais: user.pais || "No especificado",
  estiloFavorito: user.estiloFavorito || "No definido 🍻",
  followers: user.followers?.map?.((f) => ({
    _id: f._id,
    username: f.username,
    fotoPerfil: f.fotoPerfil,
  })) || [],
  following: user.following?.map?.((f) => ({
    _id: f._id,
    username: f.username,
    fotoPerfil: f.fotoPerfil,
  })) || [],
  badges: user.badges || [],
  fechaCreacion: user.createdAt,
});


// 🛠️ ACTUALIZAR CREDENCIALES DEL USUARIO
export const actualizarCredenciales = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, currentPassword, newPassword } = req.body;

    if (!currentPassword) {
      return res.status(400).json({ exito: false, mensaje: "Debes ingresar tu contraseña actual" });
    }

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ exito: false, mensaje: "Usuario no encontrado" });

    // Verificación de contraseña actual
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      return res.status(401).json({ exito: false, mensaje: "Contraseña actual incorrecta" });
    }

    // Solo actualiza si hay cambios
    let cambios = false;

    if (username && username !== user.username) {
      user.username = username;
      cambios = true;
    }

    if (newPassword && newPassword.length >= 6) {
      user.password = newPassword; // El pre-save se encarga del hash
      cambios = true;
    }

    if (!cambios) {
      return res.status(400).json({ exito: false, mensaje: "No hay cambios para guardar" });
    }

    await user.save();
    res.json({ exito: true, mensaje: "✅ Cambios guardados correctamente" });

  } catch (error) {
    console.error("❌ Error en actualizarCredenciales:", error);
    res.status(500).json({
      exito: false,
      mensaje: "❌ Error interno al actualizar credenciales",
      error: error.message
    });
  }
};

export const actualizarPerfilUsuario = async (req, res) => {
  try {
    const { userId } = req.params;
    const camposEditables = ["username", "ciudad", "pais", "bio", "sitioWeb", "pronombres", "fotoPerfil"];
    const actualizaciones = {};

    camposEditables.forEach((campo) => {
      if (req.body[campo] !== undefined) {
        actualizaciones[campo] = req.body[campo];
      }
    });

    const usuarioActualizado = await User.findByIdAndUpdate(userId, actualizaciones, { new: true });

    if (!usuarioActualizado) {
      return res.status(404).json({ exito: false, mensaje: "Usuario no encontrado" });
    }

    res.json({ exito: true, mensaje: "Perfil actualizado con éxito", usuario: buildUserResponse(usuarioActualizado) });
  } catch (error) {
    console.error("❌ Error al actualizar perfil:", error);
    res.status(500).json({ exito: false, mensaje: "Error al actualizar perfil", error: error.message });
  }

  console.log("🔁 Actualizando perfil con:", req.body);

};
