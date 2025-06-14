import Location from '../models/Locations.js';
import Lugares from '../models/Locations.js';
import axios from 'axios';
import multer from 'multer';
import logger from '../utils/logger.js';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// 📸 Multer para subida de imágenes/videos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join('public', 'uploads', 'locations');
  
      // Crear carpeta si no existe
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
  
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname);
    }
  });
  
  export const upload = multer({ storage });

/* ───────────────────────────────
🟢 CREAR LUGARES
─────────────────────────────── */
// 🟢 Crear nuevo lugar
export const createLocation = async (req, res) => {
  try {
    console.log("🟡 Body recibido:", req.body);
    console.log("🟡 Archivo recibido:", req.file);

    const { nombre, descripcion, direccion } = req.body;
    const imagen = req.file?.filename;

    if (!nombre || !descripcion || !direccion || !imagen) {
      console.warn("⚠️ Falta uno o más campos obligatorios");
      return res.status(400).json({
        mensaje: "Todos los campos son obligatorios",
        data: req.body
      });
    }

    // 👇 parsear la dirección
    let direccionParsed;
    try {
      direccionParsed = JSON.parse(direccion);
    } catch (e) {
      return res.status(400).json({ mensaje: "Error al parsear la dirección" });
    }

    const { ciudad, pais, calle, estado } = direccionParsed;

    if (!ciudad || !pais || !calle || !estado) {
      return res.status(400).json({
        mensaje: "Faltan campos dentro de la dirección",
        data: direccionParsed
      });
    }

    const nuevoLugar = new Location({
      nombre,
      descripcion,
      direccion: direccionParsed,
      imagen: `/uploads/locations/${imagen}`,
      usuario: req.body.usuario,
    });

    await nuevoLugar.save();

    return res.status(201).json({
      mensaje: "Lugar creado exitosamente",
      data: nuevoLugar,
    });
  } catch (error) {
    console.error("❌ Error al crear lugar:", error);
    return res.status(500).json({
      mensaje: "Error del servidor",
    });
  }
};



export const createMultipleLocations = async (req, res) => {
  try {
    const locations = req.body;
    if (!Array.isArray(locations) || locations.length === 0) {
      return res.status(400).json({ message: 'Array de lugares vacío o inválido' });
    }

    const createdLocations = await Location.insertMany(locations);
    res.status(201).json({ message: 'Lugares creados exitosamente', data: createdLocations });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear lugares', error });
  }
};

/* ───────────────────────────────
🔍 OBTENER LUGARES
─────────────────────────────── */
// locationsController.js
export const getLocations = async (req, res) => {
  try {
    const lugares = await Location.find()
      .sort({ createdAt: -1 })
      .populate('comentarios.usuario', 'username'); // 🔥 ESTE populate falta

    res.json({ exito: true, data: lugares });
  } catch (error) {
    res.status(500).json({ exito: false, mensaje: "Error al obtener lugares" });
  }
};

export const getLocationById = async (req, res) => {
  try {
    const location = await Location.findById(req.params.id)
      .populate('comentarios.usuario', 'username'); // 🔥 ESTE populate es vital

    if (!location) return res.status(404).json({ message: 'Local no encontrado' });

    res.json({ data: location });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el local', error });
  }
};

  

export const getTopRatedLocations = async (req, res) => {
  try {
    const topLocations = await Lugares.find().sort({ calificacionPromedio: -1 }).limit(5);
    res.json(topLocations);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener locales mejor calificados', error });
  }
};

export const getNearbyLocations = async (req, res) => {
  try {
    const { lat, lng, maxDistance = 5000 } = req.query;
    if (!lat || !lng) return res.status(400).json({ message: 'Se requieren coordenadas' });

    const locations = await Lugares.aggregate([
      {
        $geoNear: {
          near: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          distanceField: 'distance',
          maxDistance: parseInt(maxDistance),
          spherical: true
        }
      }
    ]);

    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener locales cercanos', error });
  }
};

export const searchLocations = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ message: 'Término de búsqueda requerido' });

    const locations = await Lugares.find({
      $or: [
        { nombre: new RegExp(query, 'i') },
        { 'direccion.ciudad': new RegExp(query, 'i') },
        { 'seleccionCervezas.tipo': new RegExp(query, 'i') }
      ]
    }).populate('seleccionCervezas');

    res.json({ message: 'Resultados de búsqueda', data: locations });
  } catch (error) {
    res.status(500).json({ message: 'Error en la búsqueda', error });
  }
};

export const filterLocationsByBeerType = async (req, res) => {
  try {
    const { beerType } = req.query;
    if (!beerType) return res.status(400).json({ message: 'Tipo de cerveza requerido' });

    const locations = await Lugares.find({
      'seleccionCervezas.tipo': new RegExp(beerType, 'i')
    }).populate('seleccionCervezas');

    res.json({ message: `Locales con tipo ${beerType}`, data: locations });
  } catch (error) {
    res.status(500).json({ message: 'Error al filtrar por tipo de cerveza', error });
  }
};

/* ───────────────────────────────
📝 INTERACCIONES: RESEÑAS Y FAVORITOS
─────────────────────────────── */
export const addReviewToLocation = async (req, res) => {
  try {
    const { comentario, puntuacion } = req.body;

    if (!comentario || !puntuacion || puntuacion < 1 || puntuacion > 5) {
      return res.status(400).json({ message: 'Comentario y puntuación válidos requeridos' });
    }

    const location = await Location.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ message: 'Local no encontrado' });
    }

    location.comentarios.push({
      usuario: req.user.id, // Aquí usas el usuario del token JWT
      comentario,
      puntuacion,
      fecha: new Date(),
    });

    await location.save();

    // 🔥 Ahora traemos de nuevo el location actualizado, populado
    const updatedLocation = await Location.findById(req.params.id)
      .populate('seleccionCervezas')
      .populate('comentarios.usuario', 'nombre');

    res.json({ message: 'Comentario agregado', data: updatedLocation });
  } catch (error) {
    console.error('❌ Error al agregar comentario:', error);
    res.status(500).json({ message: 'Error al agregar comentario', error });
  }
};

// Editar comentario
export const editReviewLocation = async (req, res) => {
  try {
    const { comentario, puntuacion } = req.body;
    const { id: locationId, reviewId } = req.params;

    const location = await Location.findById(locationId);
    if (!location) return res.status(404).json({ message: 'Local no encontrado' });

    const review = location.comentarios.id(reviewId);
    if (!review) return res.status(404).json({ message: 'Comentario no encontrado' });

    // Solo permitir editar al dueño del comentario
    if (review.usuario.toString() !== req.user.id) {
      return res.status(403).json({ message: 'No tienes permiso para editar este comentario' });
    }

    if (comentario) review.comentario = comentario;
    if (puntuacion) review.puntuacion = puntuacion;

    await location.save();

    const updatedLocation = await Location.findById(locationId)
      .populate('seleccionCervezas')
      .populate('comentarios.usuario', 'nombre');

    res.json({ message: 'Comentario actualizado', data: updatedLocation });
  } catch (error) {
    console.error("❌ Error al editar comentario:", error);
    res.status(500).json({ message: 'Error al editar comentario', error });
  }
};

// Eliminar comentario
export const deleteReviewLocation = async (req, res) => {
  try {
    const { id, comentarioId } = req.params;
    const userId = req.user.id;

    const lugar = await Location.findById(id);
    if (!lugar) {
      return res.status(404).json({ exito: false, mensaje: "Lugar no encontrado" });
    }

    const review = lugar.comentarios.id(comentarioId);
    if (!review) {
      return res.status(404).json({ exito: false, mensaje: "Comentario no encontrado" });
    }

    const autorId = review.usuario?._id?.toString() || review.usuario?.toString();
    if (!autorId || autorId !== userId) {
      return res.status(403).json({ exito: false, mensaje: "No tienes permisos para eliminar este comentario" });
    }

    lugar.comentarios = lugar.comentarios.filter(c => c._id.toString() !== comentarioId);
    await lugar.save();

    res.json({ exito: true, mensaje: "Comentario eliminado correctamente" });
  } catch (error) {
    console.error("❌ Error al eliminar comentario de lugar:", error);
    res.status(500).json({ exito: false, mensaje: "Error interno del servidor" });
  }
};

export const toggleFavoriteLocation = async (req, res) => {
  try {
    const location = await Lugares.findById(req.params.id);
    if (!location) return res.status(404).json({ message: 'Local no encontrado' });

    const user = req.user.id;
    const isFavorite = location.favoritos?.includes(user);

    if (isFavorite) {
      location.favoritos = location.favoritos.filter(id => id.toString() !== user);
    } else {
      location.favoritos = [...(location.favoritos || []), user];
    }

    await location.save();
    res.json({ message: `Local ${isFavorite ? 'eliminado' : 'agregado'} de favoritos`, data: location });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar favoritos', error });
  }
};

/* ───────────────────────────────
📤 ACTUALIZAR Y ELIMINAR
─────────────────────────────── */
export const updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const location = await Lugares.findById(id);
    if (!location) return res.status(404).json({ message: 'Local no encontrado' });

    if (updateData.direccion) {
      const { calle, ciudad, estado, pais } = updateData.direccion;
      const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(`${calle}, ${ciudad}, ${estado}, ${pais}`)}&key=${GOOGLE_MAPS_API_KEY}`;
      const response = await axios.get(geocodeUrl);
      if (response.data.status === 'OK') {
        const { lat, lng } = response.data.results[0].geometry.location;
        updateData.coordenadas = { lat, lng };
      }
    }

    const updatedLocation = await Lugares.findByIdAndUpdate(id, updateData, { new: true });
    res.json({ message: 'Local actualizado correctamente', data: updatedLocation });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar local', error });
  }
};

export const deleteLocation = async (req, res) => {
  try {
    const deletedLocation = await Lugares.findByIdAndDelete(req.params.id);
    if (!deletedLocation) return res.status(404).json({ message: 'Local no encontrado' });
    res.json({ message: 'Local eliminado correctamente', data: deletedLocation });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar local', error });
  }
};

/* ───────────────────────────────
📸 MULTIMEDIA
─────────────────────────────── */
export const uploadLocationImage = async (req, res) => {
  try {
    const location = await Lugares.findById(req.params.id);
    if (!location) return res.status(404).json({ message: 'Local no encontrado' });

    if (!req.file) return res.status(400).json({ message: 'No se ha subido ninguna imagen' });

    const imageUrl = `/uploads/locations/${req.file.filename}`;
    location.imagen = imageUrl;
    await location.save();

    res.json({ message: 'Imagen subida correctamente', data: location });
  } catch (error) {
    res.status(500).json({ message: 'Error al subir imagen', error });
  }
};

export const uploadValidationVideo = async (req, res) => {
  try {
    const location = await Lugares.findById(req.params.id);
    if (!location) return res.status(404).json({ message: 'Local no encontrado' });

    const videoPath = `/uploads/videos/${req.file.filename}`;
    location.videos = [...(location.videos || []), videoPath];
    await location.save();

    res.json({ message: 'Video subido correctamente', data: videoPath });
  } catch (error) {
    res.status(500).json({ message: 'Error al subir el video', error });
  }
};



export default {
    createLocation,
    createMultipleLocations,
    getLocations,
    getLocationById,
    getTopRatedLocations,
    getNearbyLocations,
    searchLocations,
    filterLocationsByBeerType,
    addReviewToLocation,
    toggleFavoriteLocation,
    updateLocation,
    deleteLocation,
    uploadLocationImage,
    uploadValidationVideo
  };
  