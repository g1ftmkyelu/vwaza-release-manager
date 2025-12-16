import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

declare module 'fastify' {
  interface FastifyInstance {
    db: Pool;
  }
}

const dbPlugin = fp(async (fastify: FastifyInstance) => {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    fastify.log.error('DATABASE_URL environment variable is not set.');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString,
  });

  fastify.decorate('db', pool);

  fastify.addHook('onClose', async (instance) => {
    await instance.db.end();
    fastify.log.info('PostgreSQL connection pool closed.');
  });

  try {
    await pool.query('SELECT 1');
    fastify.log.info('PostgreSQL connected successfully.');
  } catch (err: unknown) { 
    fastify.log.error({ message: 'Failed to connect to PostgreSQL:', error: err });
    process.exit(1);
  }
});

export default dbPlugin;