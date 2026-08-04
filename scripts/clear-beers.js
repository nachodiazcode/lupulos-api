import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import Beer from '../src/models/Beer.js';

const run = async () => {
  await connectDB();

  const before = await Beer.countDocuments();
  const { deletedCount } = await Beer.deleteMany({});
  const after = await Beer.countDocuments();

  console.log(`🍺 Cervezas antes: ${before}`);
  console.log(`🗑️  Eliminadas: ${deletedCount}`);
  console.log(`✅ Cervezas ahora: ${after}`);

  await mongoose.connection.close();
  process.exit(0);
};

run().catch(async (err) => {
  console.error('❌ Error al limpiar cervezas:', err);
  await mongoose.connection.close().catch(() => {});
  process.exit(1);
});
