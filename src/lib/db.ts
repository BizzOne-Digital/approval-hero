import mongoose from 'mongoose';

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
}

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.warn('[db] MONGO_URI is not set — CMS API routes will fail.');
}

let cache = global.mongooseCache;
if (!cache) {
  cache = global.mongooseCache = { conn: null, promise: null };
}

export async function connectDB(): Promise<typeof mongoose> {
  if (!MONGO_URI) {
    throw new Error('MONGO_URI environment variable is not configured');
  }
  if (cache.conn) return cache.conn;
  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGO_URI, { bufferCommands: false });
  }
  cache.conn = await cache.promise;
  return cache.conn;
}
