import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
    receptor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Usuario que recibe la notificación
    emisor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },  // Usuario que da el like
    tipo: { type: String, enum: ["like"], required: true }, // Tipo de notificación (puedes agregar más en el futuro)
    mensaje: { type: String, required: true },
    visto: { type: Boolean, default: false },  // Si el usuario ya vio la notificación
    createdAt: { type: Date, default: Date.now }
});

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
