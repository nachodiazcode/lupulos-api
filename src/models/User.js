import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  // 👤 Datos principales
  username: { type: String, required: true, unique: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Email inválido"],
  },
  password: {
    type: String,
    required: function () {
      return this.provider === "local";
    },
  },
  provider: { type: String, default: "local" }, // 'local', 'google', 'github', etc.

  // 🎨 Personalización
  fotoPerfil: { type: String, default: "https://www.example.com/default-avatar.jpg" },
  fotoBanner: { type: String, default: "" },
  bio: { type: String, default: "" },
  ciudad: { type: String, default: "" },
  pais: { type: String, default: "" },
  fechaNacimiento: { type: Date },
  estiloFavorito: { type: String, default: "" },
  perfilPublico: { type: Boolean, default: true },

  // 📬 Notificaciones
  notificaciones: {
    comentarios: { type: Boolean, default: true },
    likes: { type: Boolean, default: true },
    nuevosSeguidores: { type: Boolean, default: true },
  },

  // 🔐 Seguridad
  isVerified: { type: Boolean, default: false },
  refreshToken: { type: String, default: null },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },

  // 🤝 Social
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] }],

  // 📸 Actividad
  cervezasSubidas: [{ type: mongoose.Schema.Types.ObjectId, ref: "Beer", default: [] }],
  lugaresSubidos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Location", default: [] }],
  postsCreados: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post", default: [] }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post", default: [] }],
  comentarios: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: [] }],

  // 🧠 Preferencias
  preferenciasDeSabor: {
    amargor: { type: Number, default: 3 }, // escala 1–5
    dulzor: { type: Number, default: 3 },
    aroma: { type: Number, default: 3 },
  },

  // 🏅 Gamificación
  badges: [
    {
      nombre: String,
      descripcion: String,
      icono: String,
      fechaObtenido: { type: Date, default: Date.now },
    },
  ],

  // 📖 Notas de cata personales
  notasDeCata: [
    {
      cerveza: { type: mongoose.Schema.Types.ObjectId, ref: "Beer" },
      aroma: String,
      sabor: String,
      amargor: Number,
      comentarioGeneral: String,
      fecha: { type: Date, default: Date.now },
    },
  ],

  // 📊 Métricas
  loginCount: { type: Number, default: 0 },
  lastLogin: { type: Date },
  reputacion: { type: Number, default: 0 },

  // ⏪ Historial
  historial: [
    {
      accion: String,
      fecha: { type: Date, default: Date.now },
      referenciaId: mongoose.Schema.Types.ObjectId,
      tipo: String,
    },
  ],

  // 🚫 Moderación
  baneado: { type: Boolean, default: false },
  motivoBaneo: { type: String, default: "" },
  reportesRecibidos: [
    {
      motivo: String,
      fecha: { type: Date, default: Date.now },
      por: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
  ],

  // 💳 Monetización / roles
  rol: { type: String, enum: ["usuario", "admin", "moderador", "premium"], default: "usuario" },
  suscripcionActiva: { type: Boolean, default: false },
  plan: { type: String, enum: ["free", "premium", "pro"], default: "free" },

  // 📅 Metadatos
  createdAt: { type: Date, default: Date.now, index: true },
});

// 🔐 Hash de contraseña
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// 🔑 Método para comparar contraseña
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.plugin(mongoosePaginate);

const User = mongoose.model("User", userSchema);
export default User;
