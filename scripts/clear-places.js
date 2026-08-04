import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import Place from '../src/models/Place.js';

const run = async () => {
  await connectDB();

  const before = await Place.countDocuments();
  const { deletedCount } = await Place.deleteMany({});
  const after = await Place.countDocuments();

  console.log(`📍 Lugares antes: ${before}`);
  console.log(`🗑️  Eliminados: ${deletedCount}`);
  console.log(`✅ Lugares ahora: ${after}`);

  await mongoose.connection.close();
  process.exit(0);
};

run().catch(async (err) => {
  console.error('❌ Error al limpiar lugares:', err);
  await mongoose.connection.close().catch(() => {});
  process.exit(1);
});
