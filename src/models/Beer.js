import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const RespuestaSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  comentario: { type: String, required: true },
  creadoEn: { type: Date, default: Date.now },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  video: { type: String, default: "" },
});

const CervezaSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  cerveceria: { type: String, required: true, trim: true },
  tipo: { type: String, required: true, trim: true },
  abv: { type: Number, required: true, min: 0, max: 20 },
  descripcion: { type: String, trim: true },
  imagen: { type: String },
  video: { type: String, default: "" },
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  reviews: [
    {
      usuario: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      comentario: { type: String, required: true },
      calificacion: { type: Number, min: 1, max: 5 },
      creadoEn: { type: Date, default: Date.now },
      likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      video: { type: String, default: "" },
      respuestas: [RespuestaSchema]
    }
  ],
  calificacionPromedio: {
    type: Number,
    default: 0
  }
}, { timestamps: true });


CervezaSchema.plugin(mongoosePaginate);
export default mongoose.model("Cerveza", CervezaSchema);
