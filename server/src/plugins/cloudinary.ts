import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

declare module 'fastify' {
  interface FastifyInstance {
    cloudinary: typeof cloudinary;
  }
}

const cloudinaryPlugin = fp(async (fastify: FastifyInstance) => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    fastify.log.warn('Cloudinary environment variables (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are not fully set. Cloudinary features may not work.');
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  fastify.decorate('cloudinary', cloudinary);
  fastify.log.info('Cloudinary configured.');
});

export default cloudinaryPlugin;