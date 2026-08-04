import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import Post from '../src/models/Post.js';
import Comment from '../src/models/Comment.js';

const run = async () => {
  await connectDB();

  const postsBefore = await Post.countDocuments();
  const commentsBefore = await Comment.countDocuments();

  const posts = await Post.deleteMany({});
  const comments = await Comment.deleteMany({});

  console.log(`📝 Posts antes: ${postsBefore} → eliminados: ${posts.deletedCount}`);
  console.log(`💬 Comentarios antes: ${commentsBefore} → eliminados: ${comments.deletedCount}`);
  console.log(`✅ Posts ahora: ${await Post.countDocuments()} | Comentarios ahora: ${await Comment.countDocuments()}`);

  await mongoose.connection.close();
  process.exit(0);
};

run().catch(async (err) => {
  console.error('❌ Error al limpiar posts:', err);
  await mongoose.connection.close().catch(() => {});
  process.exit(1);
});
