// src/lib/db.ts
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'TheDrip',
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  max: 20,
  idleTimeoutMillis: 30000,
});

pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1); // Exit process if database connection has a fatal error
});

export default pool;

// Optional: Add a function to gracefully close the pool on server shutdown
process.on('SIGINT', async () => {
  await pool.end();
  console.log('PostgreSQL connection pool closed.');
  process.exit(0);
});
