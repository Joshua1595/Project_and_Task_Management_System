import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET || 'smart_task_secret_key_2026',
  JWT_EXPIRES_IN: '24h',
  FIRESTORE_DB_ID: 'ai-studio-smarttaskproject-8683979c-16a0-4711-afde-f24ca5063458',
};
