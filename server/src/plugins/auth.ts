import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';
import dotenv from 'dotenv';
import { AuthenticatedUser, UserRole } from '@shared/types';

dotenv.config();

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: AuthenticatedUser;
    user: AuthenticatedUser;
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    authorize: (roles: UserRole[]) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

const authPlugin = fp(async (fastify: FastifyInstance) => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    fastify.log.error('JWT_SECRET environment variable is not set.');
    process.exit(1);
  }

  fastify.register(jwt, {
    secret: jwtSecret,
  });

  fastify.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch (err: any) {

      if (err.name === 'FastifyJWTNoAuthorizationInHeaderError' || err.name === 'FastifyJWTTokenExpiredError') {
        throw fastify.httpErrors.unauthorized(err.message);
      }
      throw fastify.httpErrors.unauthorized('Invalid or missing authentication token.');
    }
  });

  fastify.decorate('authorize', (roles: UserRole[]) => {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify();
        if (!roles.includes(request.user.role)) {
          throw fastify.httpErrors.forbidden('Insufficient role to access this resource.');
        }
      } catch (err: any) {
 
        if (err.name === 'FastifyJWTNoAuthorizationInHeaderError' || err.name === 'FastifyJWTTokenExpiredError') {
          throw fastify.httpErrors.unauthorized(err.message);
        }
        if (err.statusCode === 403) { 
          throw err;
        }
        throw fastify.httpErrors.unauthorized('Invalid or missing authentication token.');
      }
    };
  });
});

export default authPlugin;