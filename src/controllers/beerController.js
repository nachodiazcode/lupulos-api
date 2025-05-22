// 🟡 Controlador de Cervezas con logs mejorados
import Cerveza from '../models/Beer.js';
import logger from '../utils/logger.js';

// 🛠️ Middleware para manejo de errores async
const asyncHandler = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

/* ───────────────────────────────
   📥 GET: Obtener cervezas
─────────────────────────────── */

// 🔍 Obtener todas las cervezas
export const getAllBeers = asyncHandler(async (req, res) => {
  const beers = await Cerveza.find()
    .populate('usuario', 'username')
    .populate('reviews.usuario', 'username')


  logger.info(`🔍 GET /api/beer → ${beers.length} cervezas encontradas`);
  res.status(200).json({ exito: true, mensaje: `Se encontraron ${beers.length} cervezas.`, datos: beers });
});

// 🔍 Buscar cervezas por filtros
export const searchBeers = asyncHandler(async (req, res) => {
  const { nombre, tipo, cerveceria, minABV, maxABV } = req.query;
  let filter = {};
  if (nombre) filter.nombre = { $regex: nombre, $options: 'i' };
  if (tipo) filter.tipo = { $regex: tipo, $options: 'i' };
  if (cerveceria) filter.cerveceria = { $regex: cerveceria, $options: 'i' };
  if (minABV) filter.abv = { ...filter.abv, $gte: parseFloat(minABV) };
  if (maxABV) filter.abv = { ...filter.abv, $lte: parseFloat(maxABV) };

  const beers = await Cerveza.find(filter).populate('reviews.usuario', 'username');
  logger.info(`🔎 Búsqueda → ${beers.length} resultados`);
  res.json({ exito: true, mensaje: `Se encontraron ${beers.length} cervezas`, datos: beers });
});

// 🔍 Obtener cerveza por ID
// ✅ Backend - getBeerById con populate
export const getBeerById = async (req, res) => {
  try {
    const cerveza = await Cerveza.findById(req.params.id)
      .populate('usuario', 'username fotoPerfil')
      .populate('reviews.usuario', 'username fotoPerfil')

      .populate('reviews.respuestas.usuario', 'username fotoPerfil');
      

    if (!cerveza) {
      return res.status(404).json({ exito: false, mensaje: "Cerveza no encontrada" });
    }

    res.status(200).json({ exito: true, datos: cerveza });
  } catch (error) {
    console.error('❌ Error al obtener cerveza:', error);
    res.status(500).json({ exito: false, mensaje: 'Error del servidor' });
  }
  
};

// 🔝 Obtener mejor calificadas
export const getTopRatedBeers = asyncHandler(async (req, res) => {
  const topRatedBeers = await Cerveza.find().sort({ calificacionPromedio: -1 }).limit(10);
  res.json({ exito: true, mensaje: `Se encontraron ${topRatedBeers.length} mejor calificadas`, datos: topRatedBeers });
});

// 🆕 Obtener nuevas
export const getNewBeers = asyncHandler(async (req, res) => {
  const newBeers = await Cerveza.find().sort({ createdAt: -1 }).limit(10);
  res.json({ exito: true, mensaje: `Se encontraron ${newBeers.length} nuevas`, datos: newBeers });
});

// 🌟 Cervezas destacadas
export const getFeaturedBeers = asyncHandler(async (req, res) => {
  const beers = await Cerveza.find({ esDestacada: true });
  res.json({ exito: true, mensaje: `Se encontraron ${beers.length} destacadas`, datos: beers });
});

// 🍺 Cerveza del día
export const getBeerOfTheDay = asyncHandler(async (req, res) => {
  await Cerveza.updateMany({}, { esCervezaDelDia: false });

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  let selectedBeer = await Cerveza.findOne({ createdAt: { $gte: yesterday } }).sort({ likes: -1 });

  if (!selectedBeer) {
    const randomBeer = await Cerveza.aggregate([{ $sample: { size: 1 } }]);
    if (randomBeer.length > 0) selectedBeer = await Cerveza.findById(randomBeer[0]._id);
  }

  if (!selectedBeer) {
    return res.status(404).json({ exito: false, mensaje: "No hay cervezas disponibles para seleccionar." });
  }

  selectedBeer.esCervezaDelDia = true;
  selectedBeer.ultimaSeleccion = new Date();
  await selectedBeer.save();

  res.json({ exito: true, mensaje: '🎉 Nueva Cerveza del Día', datos: selectedBeer });
});

/* ───────────────────────────────
   📝 POST: Crear y agregar datos
─────────────────────────────── */


export const createBeer = async (req, res) => {
  try {
    const { nombre, tipo, cerveceria, abv, descripcion } = req.body;
    const usuario = req.user?.id;

    if (!req.file) {
      return res.status(400).json({ exito: false, mensaje: "La imagen es obligatoria" });
    }

    const imagen = req.file.path
      .replace(/^.*public/, "")   // ✅ solo deja la parte pública
      .replace(/\\/g, "/");

    if (
      !nombre?.trim() ||
      !tipo?.trim() ||
      !cerveceria?.trim() ||
      !descripcion?.trim() ||
      !abv ||
      !usuario
    ) {
      return res.status(400).json({ exito: false, mensaje: "Faltan campos obligatorios" });
    }

    const nuevaCerveza = new Cerveza({
      nombre,
      tipo,
      cerveceria,
      abv: parseFloat(abv),
      descripcion,
      imagen,
      usuario,
    });

    await nuevaCerveza.save();
    res.status(201).json({ exito: true, mensaje: "Cerveza creada", datos: nuevaCerveza });
  } catch (error) {
    console.error("❌ Error al crear cerveza:", error);
    res.status(500).json({ exito: false, mensaje: "Error interno del servidor" });
  }
};


// 📷 Subir imagen
export const uploadBeerImage = asyncHandler(async (req, res) => {
  const beer = await Cerveza.findById(req.params.id);
  if (!beer) return res.status(404).json({ exito: false, mensaje: 'Cerveza no encontrada' });

  if (!req.file) return res.status(400).json({ exito: false, mensaje: 'No se recibió imagen' });

  beer.imagen = `/uploads/beers/${req.file.filename}`;
  await beer.save();

  logger.info(`📷 Imagen subida por ${req.user.id} para cerveza ${beer._id}`);
  res.json({ exito: true, mensaje: 'Imagen subida', datos: { imagen: beer.imagen } });
});

// 📚 Crear múltiples cervezas
export const createMultipleBeers = asyncHandler(async (req, res) => {
  const beers = req.body.beers;
  if (!Array.isArray(beers) || beers.length === 0) {
    return res.status(400).json({ exito: false, mensaje: 'Array vacío o inválido' });
  }

  const results = await Cerveza.insertMany(beers);
  res.status(201).json({ exito: true, mensaje: 'Cervezas creadas', datos: results });
});

/* ───────────────────────────────
   ✏️ PUT: Actualizar
─────────────────────────────── */

// ✏️ Actualizar cerveza
export const updateBeer = asyncHandler(async (req, res) => {
  const beer = await Cerveza.findById(req.params.id);
  if (!beer) return res.status(404).json({ exito: false, mensaje: 'No encontrada' });

  if (beer.usuario.toString() !== req.user.id) {
    return res.status(403).json({ exito: false, mensaje: 'Sin permisos' });
  }

  const updatedBeer = await Cerveza.findByIdAndUpdate(req.params.id, req.body, { new: true });
  logger.info(`✏️ Actualizada por ${req.user.id} → ${updatedBeer.nombre}`);
  res.json({ exito: true, mensaje: 'Cerveza actualizada', cerveza: updatedBeer });
});

/* ───────────────────────────────
   ❌ DELETE: Eliminar
─────────────────────────────── */

// 🗑️ Eliminar cerveza
export const deleteBeer = asyncHandler(async (req, res) => {
  try {
    const beer = await Cerveza.findById(req.params.id);
    if (!beer) return res.status(404).json({ mensaje: 'Cerveza no encontrada' });

    if (beer.usuario.toString() !== req.user.id) {
      return res.status(403).json({ mensaje: 'No autorizado' });
    }

    await beer.deleteOne();
    res.json({ mensaje: 'Cerveza eliminada correctamente' });

  } catch (error) {
    console.error('❌ Error en deleteBeer:', error);
    res.status(500).json({ mensaje: 'Error interno del servidor' });
  }
});


/* ───────────────────────────────
   ❤️ Interacciones: Likes / Reviews / Rating
─────────────────────────────── */

// ✅ Dar o quitar like
export const likeBeer = asyncHandler(async (req, res) => {
  const beer = await Cerveza.findById(req.params.id);
  if (!beer) return res.status(404).json({ exito: false, mensaje: "No encontrada" });

  const userId = req.user.id;
  const index = beer.likes.indexOf(userId);

  if (index > -1) {
    beer.likes.splice(index, 1);
    logger.info(`❌ Like removido por ${userId}`);
  } else {
    beer.likes.push(userId);
    logger.info(`✅ Like agregado por ${userId}`);
  }

  await beer.save();
  res.json({ exito: true, mensaje: index > -1 ? "Like eliminado" : "Like agregado", likes: beer.likes.length });
});

// 📝 Agregar review
export const addBeerReview = asyncHandler(async (req, res) => {
  const { comentario, calificacion, video } = req.body;
  const userId = req.user.id;
  const beer = await Cerveza.findById(req.params.id);
  if (!beer) return res.status(404).json({ exito: false, mensaje: "No encontrada" });

  if (!comentario || !calificacion) {
    return res.status(400).json({ exito: false, mensaje: "Comentario y calificación requeridos" });
  }

  beer.reviews.push({ usuario: userId, comentario, calificacion, video });
  await beer.save();

  logger.info(`📝 Reseña añadida por ${userId}`);
  res.json({ exito: true, mensaje: "Reseña agregada", reviews: beer.reviews });
});

// 💬 Responder a una review
export const replyToReview = asyncHandler(async (req, res) => {
  const { id, reviewId } = req.params;
  const { comentario, video } = req.body;
  const userId = req.user.id;

  const beer = await Cerveza.findById(id);
  if (!beer) return res.status(404).json({ exito: false, mensaje: "No encontrada" });

  const review = beer.reviews.id(reviewId);
  if (!review) return res.status(404).json({ exito: false, mensaje: "Comentario no encontrado" });

  const nuevaRespuesta = {
    usuario: userId,
    comentario,
    video,
    creadoEn: new Date(),
    likes: []
  };

  review.respuestas = review.respuestas || [];
  review.respuestas.push(nuevaRespuesta);
  await beer.save();

  logger.info(`💬 Respuesta agregada por ${userId}`);
  res.json({ exito: true, mensaje: "Respuesta agregada", respuestas: review.respuestas });
});

// 👍 Like a comentario
export const likeReview = asyncHandler(async (req, res) => {
  const { beerId, reviewId } = req.params;
  const userId = req.user.id;

  const beer = await Cerveza.findById(beerId);
  if (!beer) return res.status(404).json({ exito: false, mensaje: "No encontrada" });

  const review = beer.reviews.id(reviewId);
  if (!review) return res.status(404).json({ exito: false, mensaje: "Comentario no encontrado" });

  const index = review.likes.indexOf(userId);
  if (index > -1) review.likes.splice(index, 1);
  else review.likes.push(userId);

  await beer.save();

  res.json({
    exito: true,
    mensaje: index > -1 ? "Like eliminado en comentario" : "Like agregado en comentario",
    likes: review.likes.length
  });
});

// ⭐ Calificar una cerveza (versión mejorada PRO)
export const rateBeer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating } = req.body;
  const userId = req.user.id;

  if (!rating) return res.status(400).json({ exito: false, mensaje: 'Calificación requerida' });

  const beer = await Cerveza.findById(id);
  if (!beer) return res.status(404).json({ exito: false, mensaje: 'No encontrada' });

  // 🛡️ Asegurarse que ratings exista
  if (!beer.ratings) {
    beer.ratings = [];
  }

  // 🚫 Revisar si el usuario ya calificó antes
  const yaCalifico = beer.ratings.some(r => r.userId.toString() === userId);
  if (yaCalifico) {
    return res.status(400).json({ exito: false, mensaje: 'Ya calificaste esta cerveza 🍺' });
  }

  // ✅ Agregar nueva calificación
  beer.ratings.push({ userId, rating });

  // 🧮 Recalcular promedio
  const avg = beer.ratings.reduce((sum, r) => sum + r.rating, 0) / beer.ratings.length;
  beer.calificacionPromedio = avg;

  await beer.save();

  logger.info(`⭐ ${userId} calificó cerveza ${beer._id} con ${rating} estrellas`);

  res.json({ exito: true, mensaje: 'Calificación añadida exitosamente', datos: beer });
});



// ❌ Eliminar like explícitamente
export const unLikeBeer = asyncHandler(async (req, res) => {
  const beer = await Cerveza.findById(req.params.id);
  if (!beer) return res.status(404).json({ exito: false, mensaje: "Cerveza no encontrada" });

  const userId = req.user.id;
  const yaDioLike = beer.likes.includes(userId);

  if (!yaDioLike) {
    return res.status(400).json({ exito: false, mensaje: "No habías dado like" });
  }

  beer.likes = beer.likes.filter(id => id.toString() !== userId);
  await beer.save();

  logger.info(`👎 Like removido por ${userId} desde ruta explícita`);
  res.status(200).json({ exito: true, mensaje: "Like eliminado", likes: beer.likes.length });
});

export const editReview = asyncHandler(async (req, res) => {
  const { id, reviewId } = req.params;
  const { comentario, calificacion } = req.body;
  const userId = req.user.id;

  const beer = await Cerveza.findById(id);
  if (!beer) return res.status(404).json({ exito: false, mensaje: "Cerveza no encontrada" });

  const review = beer.reviews.id(reviewId);
  if (!review) return res.status(404).json({ exito: false, mensaje: "Comentario no encontrado" });

  if (review.usuario.toString() !== userId) {
    return res.status(403).json({ exito: false, mensaje: "No autorizado para editar este comentario" });
  }

  review.comentario = comentario;
  review.calificacion = calificacion;
  await beer.save();

  logger.info(`✏️ Comentario editado por ${userId} en cerveza ${beer._id}`);
  res.json({ exito: true, mensaje: "Comentario actualizado", review });
});

export const deleteReview = asyncHandler(async (req, res) => {
  const { id, reviewId } = req.params;
  const userId = req.user.id;

  const beer = await Cerveza.findById(id);
  if (!beer) return res.status(404).json({ exito: false, mensaje: "Cerveza no encontrada" });

  const review = beer.reviews.id(reviewId);
  if (!review) return res.status(404).json({ exito: false, mensaje: "Comentario no encontrado" });

  // Validación extra por si usuario viene null
  if (!review.usuario || review.usuario.toString() !== userId) {
    return res.status(403).json({ exito: false, mensaje: "No autorizado para eliminar este comentario" });
  }

  // ❗ remove() a veces falla en subdocs -> mejor filtrar manualmente
  beer.reviews = beer.reviews.filter(r => r._id.toString() !== reviewId);
  await beer.save();

  logger.info(`🗑️ Comentario eliminado por ${userId} en cerveza ${beer._id}`);
  res.json({ exito: true, mensaje: "Comentario eliminado correctamente" });
});
