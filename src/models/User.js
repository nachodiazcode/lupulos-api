import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import bcrypt from "bcryptjs";

const badgeSchema = new mongoose.Schema({
  nombre: String,
  descripcion: String,
  icono: String,
  fechaObtenido: { type: Date, default: Date.now },
});

const tastingNoteSchema = new mongoose.Schema({
  cerveza: { type: mongoose.Schema.Types.ObjectId, ref: "Beer", required: true },
  aroma: String,
  sabor: String,
  amargor: { type: Number, min: 1, max: 5 },
  comentarioGeneral: String,
  fecha: { type: Date, default: Date.now },
});

const reportSchema = new mongoose.Schema({
  motivo: String,
  fecha: { type: Date, default: Date.now },
  por: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const historySchema = new mongoose.Schema({
  accion: String,
  fecha: { type: Date, default: Date.now },
  referenciaId: mongoose.Schema.Types.ObjectId,
  tipo: String,
});

const preferencesSchema = new mongoose.Schema({
  amargor: { type: Number, default: 3, min: 1, max: 5 },
  dulzor: { type: Number, default: 3, min: 1, max: 5 },
  aroma: { type: Number, default: 3, min: 1, max: 5 },
});

const notificationsSchema = new mongoose.Schema({
  comentarios: { type: Boolean, default: true },
  likes: { type: Boolean, default: true },
  nuevosSeguidores: { type: Boolean, default: true },
});

const socialLinksSchema = new mongoose.Schema({
  github: { type: String, default: "" },
  linkedin: { type: String, default: "" },
  twitter: { type: String, default: "" },
});

const userSchema = new mongoose.Schema(
  {
    // Datos básicos
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
      required: function () { return this.provider === "local"; },
      minlength: 6,
      select: false,
    },
    provider: { type: String, default: "local" },

    // Perfil y personalización
    fotoPerfil: {
      type: String,
      default: "https://www.example.com/default-avatar.jpg",
    },
    fotoBanner: { type: String, default: "" },
    bio: { type: String, default: "", maxlength: 280 },
    ciudad: { type: String, default: "" },
    pais: { type: String, default: "" },
    fechaNacimiento: { type: Date },
    estiloFavorito: { type: String, default: "" },
    perfilPublico: { type: Boolean, default: true },

    // Notificaciones
    notificaciones: { type: notificationsSchema, default: () => ({}) },

    // Seguridad y estado
    isVerified: { type: Boolean, default: false },
    refreshToken: { type: String, default: null },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    baneado: { type: Boolean, default: false },
    motivoBaneo: { type: String, default: "" },

    // Relaciones sociales
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Actividades
    cervezasSubidas: [{ type: mongoose.Schema.Types.ObjectId, ref: "Beer" }],
    lugaresSubidos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Location" }],
    postsCreados: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    comentarios: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],

    // Preferencias
    preferenciasDeSabor: { type: preferencesSchema, default: () => ({}) },

    // Gamificación
    badges: [badgeSchema],

    // Notas de cata
    notasDeCata: [tastingNoteSchema],

    // Métricas y historial
    loginCount: { type: Number, default: 0 },
    lastLogin: { type: Date },
    reputacion: { type: Number, default: 0 },
    historial: [historySchema],

    // Reportes
    reportesRecibidos: [reportSchema],

    // Roles y suscripciones
    rol: {
      type: String,
      enum: ["usuario", "admin", "moderador", "premium"],
      default: "usuario",
    },
    suscripcionActiva: { type: Boolean, default: false },
    plan: { type: String, enum: ["free", "premium", "pro"], default: "free" },

    // Metadatos
    createdAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.plugin(mongoosePaginate);

const User = mongoose.model("User", userSchema);
export default User;
