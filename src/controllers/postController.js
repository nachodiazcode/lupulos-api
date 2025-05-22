import Post from "../models/Post.js";
import User from "../models/User.js";
import Comment from "../models/Comment.js";
import logger from "../utils/logger.js";

// 📌 Subir imagen
export const uploadPostImage = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ exito: false, mensaje: "❌ No se subió ninguna imagen." });
    }

    const ruta = `/uploads/posts/${req.file.filename}`;
    res.status(200).json({ exito: true, mensaje: "✅ Imagen subida con éxito", ruta });
  } catch (error) {
    res.status(500).json({ exito: false, mensaje: "❌ Error al subir imagen", error: error.message });
  }
};

// 📌 Obtener todos los posts
export const getAllPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = "createdAt", order = "desc" } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const posts = await Post.find()
    .populate("usuario", "username fotoPerfil _id") // ✅ aseguramos que venga el _id
    .sort({ [sort]: order === "desc" ? -1 : 1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await Post.countDocuments();

    res.json({
      exito: true,
      pagina: parseInt(page),
      totalPaginas: Math.ceil(total / limit),
      totalPosts: total,
      posts: posts.map(post => ({
        _id: post._id,
        titulo: post.titulo,
        contenido: post.contenido,
        imagenes: Array.isArray(post.imagenes) ? post.imagenes : [],
        usuario: post.usuario
          ? {
              _id: post.usuario._id, // ✅ agregado
              username: post.usuario.username,
              fotoPerfil: post.usuario.fotoPerfil
            }
          : {
              username: "Usuario eliminado",
              fotoPerfil: "/images/default-user.png"
            },
        reacciones: post.reacciones || { salud: 0, recomendado: 0, meGusta: 0 },
        comentarios: post.comentarios ? post.comentarios.length : 0,
        visitas: post.visitas || 0,
        fecha: new Date(post.fechaCreacion).toLocaleDateString("es-CL", { timeZone: "America/Santiago" })
      }))
    });
  } catch (error) {
    logger.error(`❌ Error al obtener posts: ${error.message}`);
    res.status(500).json({ exito: false, mensaje: "❌ Error al obtener posts", error: error.message });
  }
};

// 📌 Crear un post
export const createPost = async (req, res) => {
  try {
    const { titulo, contenido, usuario, imagenes = [] } = req.body;

    const nuevoPost = new Post({
      titulo,
      contenido,
      usuario,
      imagenes: Array.isArray(imagenes) ? imagenes : [imagenes],
    });

    await nuevoPost.save();

    logger.info(`✅ Nuevo post creado por usuario ${usuario}: ${titulo}`);
    res.status(201).json({ exito: true, mensaje: "✅ Post creado exitosamente", post: nuevoPost });
  } catch (error) {
    logger.error(`❌ Error al crear post: ${error.message}`);
    res.status(500).json({ exito: false, mensaje: "❌ Error al crear post", error: error.message });
  }
};

// 📌 Obtener post por ID
export const getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const { usuarioId } = req.query;

    const post = await Post.findById(id).populate("usuario", "username fotoPerfil");
    if (!post) return res.status(404).json({ exito: false, mensaje: "❌ Post no encontrado" });

    if (usuarioId && (!post.vistoPor || !post.vistoPor.includes(usuarioId))) {
      post.visitas += 1;
      post.vistoPor = [...(post.vistoPor || []), usuarioId];
      await post.save();
    }

    res.json({ exito: true, post });
  } catch (error) {
    logger.error(`❌ Error obteniendo post: ${error.message}`);
    res.status(500).json({ exito: false, mensaje: "❌ Error al obtener post", error: error.message });
  }
};

// 📌 Eliminar post
export const deletePost = async (req, res) => {
  try {
    const postEliminado = await Post.findByIdAndDelete(req.params.id);
    if (!postEliminado) {
      return res.status(404).json({ exito: false, mensaje: "❌ Post no encontrado" });
    }
    res.json({ exito: true, mensaje: "✅ Post eliminado exitosamente", postEliminado });
  } catch (error) {
    logger.error(`❌ Error eliminando post: ${error.message}`);
    res.status(500).json({ exito: false, mensaje: "❌ Error al eliminar post", error: error.message });
  }
};

// 📌 Like
export const likePost = async (req, res) => {
  const { tipo, userId } = req.body;
  const { id } = req.params;

  try {
    if (!["salud", "recomendado", "meGusta"].includes(tipo)) {
      return res.status(400).json({ exito: false, mensaje: "Tipo de reacción inválido" });
    }

    const post = await Post.findById(id);
    if (!post) return res.status(404).json({ exito: false, mensaje: "Post no encontrado" });

    const reaccion = post.reacciones[tipo] || { count: 0, usuarios: [] };
    const yaDioLike = reaccion.usuarios.includes(userId);

    if (yaDioLike) {
      return res.status(200).json({ exito: false, mensaje: "Ya reaccionaste a este post" });
    }

    reaccion.count += 1;
    reaccion.usuarios.push(userId);
    post.reacciones[tipo] = reaccion;

    await post.save();

    res.status(200).json({ exito: true, mensaje: "Reacción registrada" });
  } catch (error) {
    res.status(500).json({ exito: false, mensaje: "Error interno del servidor" });
  }
};

// 📌 Unlike
export const unlikePost = async (req, res) => {
  try {
    const { tipo, userId } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ exito: false, mensaje: "Post no encontrado" });

    if (!post.reacciones[tipo]) {
      post.reacciones[tipo] = { count: 0, usuarios: [] };
    }

    post.reacciones[tipo].usuarios = post.reacciones[tipo].usuarios.filter(
      (uid) => uid.toString() !== userId
    );
    post.reacciones[tipo].count = post.reacciones[tipo].usuarios.length;

    await post.save();

    res.json({ exito: true, mensaje: "Like quitado correctamente" });
  } catch (error) {
    res.status(500).json({ exito: false, mensaje: "Error al quitar like" });
  }
};

// 📌 Agregar comentario
export const addComment = async (req, res) => {
  const { contenido, usuarioId } = req.body;
  const { postId } = req.params;

  try {
    const nuevoComentario = new Comment({
      comentario: contenido,
      usuario: usuarioId,
      post: postId,
    });

    await nuevoComentario.save();

    await Post.findByIdAndUpdate(postId, {
      $push: { comentarios: nuevoComentario._id },
    });

    res.status(201).json({ exito: true, comentario: nuevoComentario });
  } catch (error) {
    res.status(500).json({ exito: false, mensaje: "Error al guardar comentario" });
  }
};

// 📌 Obtener comentarios de un post
export const getPostComments = async (req, res) => {
  try {
    const comentarios = await Comment.find({ post: req.params.postId })
      .sort({ fecha: -1 })
      .populate("usuario", "username");

    res.json({ exito: true, comentarios });
  } catch (error) {
    res.status(500).json({ exito: false, mensaje: "Error al obtener comentarios" });
  }
};

// 📌 Contar visita única
export const contarVisita = async (req, res) => {
  const postId = req.params.id;
  const userId = req.body.userId;

  try {
    const post = await Post.findById(postId);

    if (!post.vistoPor.includes(userId)) {
      post.vistoPor.push(userId);
      post.visitas += 1;
      await post.save();
    }

    res.json({ exito: true, mensaje: "Visita contada." });
  } catch (error) {
    res.status(500).json({ exito: false, mensaje: "Error al contar visita." });
  }
};

// 📌 Actualizar un post
export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, contenido } = req.body;

    const postActualizado = await Post.findByIdAndUpdate(
      id,
      { titulo, contenido },
      { new: true }
    );

    if (!postActualizado) {
      return res.status(404).json({ exito: false, mensaje: "Post no encontrado" });
    }

    res.json({ exito: true, mensaje: "Post actualizado", post: postActualizado });
  } catch (error) {
    res.status(500).json({ exito: false, mensaje: "Error al actualizar el post", error: error.message });
  }
};
