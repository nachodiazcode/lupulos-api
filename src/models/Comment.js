// models/Comment.js
import mongoose from "mongoose";

const CommentSchema = new mongoose.Schema({
  comentario: {
    type: String,
    required: true,
  },
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // 👈 Importante para luego hacer populate
    required: true,
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post", // 👈 Esto conecta el comentario con su post
    required: true,
  },
  fecha: {
    type: Date,
    default: Date.now,
  },
});

const Comment = mongoose.model("Comment", CommentSchema);
export default Comment;
