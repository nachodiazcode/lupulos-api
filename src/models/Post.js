import mongoose from "mongoose";
const PostSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  titulo: {
    type: String,
    required: [true, "El título es obligatorio"],
    trim: true,
    minlength: 3,
    maxlength: 100,
  },
  contenido: {
    type: String,
    required: [true, "El contenido es obligatorio"],
    trim: true,
    minlength: 5,
    maxlength: 2000,
  },
  imagenes: [{ type: String, trim: true }],
  visitas: { type: Number, default: 0 },
  vistoPor: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  reacciones: {
    salud: {
      count: { type: Number, default: 0 },
      usuarios: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },
    recomendado: {
      count: { type: Number, default: 0 },
      usuarios: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },
    meGusta: {
      count: { type: Number, default: 0 },
      usuarios: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    },
  },
  comentarios: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    },
  },
});

PostSchema.index({ usuario: 1 });
PostSchema.index({ "reacciones.meGusta.count": -1 });

const Post = mongoose.model("Post", PostSchema);
export default Post;
