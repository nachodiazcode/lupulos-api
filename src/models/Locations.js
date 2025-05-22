import mongoose from 'mongoose';

const LugaresSchema = new mongoose.Schema({
    nombre: { type: String, required: true, trim: true },
    descripcion: { type: String, trim: true }, // 📝 Descripción del lugar
    direccion: {
        calle: { type: String, required: true },
        ciudad: { type: String, required: true },
        estado: { type: String, required: true },
        pais: { type: String, required: true },
        codigoPostal: { type: String }
    },

    // coordenadas: {
    //     lat: { type: Number, required: true },
    //     lng: { type: Number, required: true }
    // },
    
    telefono: { type: String },
    sitioWeb: { type: String },
    emailContacto: { type: String },

    // 📸 Imágenes y galería
    imagen: { type: String }, // Imagen principal
    galeriaImagenes: [{ type: String }], // Galería de imágenes

    // 🍺 Cervezas disponibles
    seleccionCervezas: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Cerveza' }],

    // ⭐ Reseñas y calificaciones
    comentarios: [{
        usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        comentario: { type: String, required: true },
        puntuacion: { type: Number, min: 1, max: 5, required: true },
        fecha: { type: Date, default: Date.now }
    }],
    
    calificacionPromedio: { type: Number, default: 0 }, // ⭐ Calificación calculada

    // ⏰ Horarios de apertura
    horarios: {
        lunes: { apertura: String, cierre: String },
        martes: { apertura: String, cierre: String },
        miercoles: { apertura: String, cierre: String },
        jueves: { apertura: String, cierre: String },
        viernes: { apertura: String, cierre: String },
        sabado: { apertura: String, cierre: String },
        domingo: { apertura: String, cierre: String }
    },

    // 📱 Redes Sociales
    redesSociales: {
        facebook: { type: String },
        instagram: { type: String },
        twitter: { type: String },
        tiktok: { type: String }
    },

    // 🎉 Eventos y promociones
    eventos: [{
        nombre: { type: String },
        descripcion: { type: String },
        fecha: { type: Date }
    }],
    promociones: [{
        descripcion: { type: String },
        descuento: { type: Number }, // Descuento en porcentaje
        fechaInicio: { type: Date },
        fechaFin: { type: Date }
    }],

    // 🚀 Características del lugar
    servicios: [{ type: String }], // Ej: "Música en vivo", "Pet-friendly", "Terraza"
    esPetFriendly: { type: Boolean, default: false }, // 🐶 Pet-friendly
    tieneMusicaEnVivo: { type: Boolean, default: false },
    cuentaConTerraza: { type: Boolean, default: false },
    tieneEstacionamiento: { type: Boolean, default: false },

    // 🔥 Popularidad y ranking
    visitas: { type: Number, default: 0 }, // Número de visitas
    popularidad: { type: Number, default: 0 }, // Ranking basado en interacciones
    esDestacado: { type: Boolean, default: false }, // ⭐ Para lugares recomendados

    // 🏆 Gamificación y recompensas
    nivelLupuloso: { type: Number, default: 1 }, // 🌟 Nivel del lugar basado en interacción
    puntosRecompensa: { type: Number, default: 0 }, // 🎯 Puntos acumulables por usuarios
    tieneTriviaCerveza: { type: Boolean, default: false }, // 🍻 Trivia sobre cervezas

    // 🔒 Accesibilidad y restricciones
    esSoloPremium: { type: Boolean, default: false }, // 🔐 Para lugares exclusivos de usuarios premium
    edadMinimaRequerida: { type: Number, default: 18 }, // 🍺 Restricción de edad

    // 🔗 Relación con el dueño (para administración)
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Usuario dueño del local

    // 📅 Fecha de creación
    creadoEn: { type: Date, default: Date.now }
});

const Lugares = mongoose.model('Lugares', LugaresSchema);
export default Lugares;
