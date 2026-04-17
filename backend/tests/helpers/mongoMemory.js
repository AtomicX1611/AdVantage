import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

let mongoServer;

const MONGO_MEMORY_VERSION = process.env.MONGOMS_VERSION || "7.0.14";

export async function connectMemoryDb() {
  // Pin binary settings to avoid flaky latest-version downloads in CI/local runs.
  mongoServer = await MongoMemoryServer.create({
    binary: {
      version: MONGO_MEMORY_VERSION,
      checkMD5: false,
    },
  });
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
}

export async function clearMemoryDb() {
  const collections = mongoose.connection.collections;
  for (const key of Object.keys(collections)) {
    await collections[key].deleteMany({});
  }
}

export async function disconnectMemoryDb() {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
    mongoServer = null;
  }
}
