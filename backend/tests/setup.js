import { beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import connectDB from '../config/connectDB.js';

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  await connectDB();
});

afterAll(async () => {
  await mongoose.connection.close();
});
