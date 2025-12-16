import { FastifyReply, FastifyRequest } from 'fastify';
import { PaginationOptions } from '@shared/types';
import { UserCreatePayload, UserUpdatePayload } from '../types';
import { userService } from '../services/userService';

export const userController = {
  async createUser(request: FastifyRequest<{ Body: UserCreatePayload }>, reply: FastifyReply) {

    if (request.user.role !== 'ADMIN') {
      throw request.server.httpErrors.forbidden('Only ADMIN can create users.');
    }

    const {username, email, password_hash, role } = request.body;
    if (!email || !password_hash || !role) {
      throw request.server.httpErrors.badRequest('Email, password, and role are required.');
    }

    const existingUser = await userService.findUserByEmail(request.server, email);
    if (existingUser) {
      throw request.server.httpErrors.conflict('User with this email already exists.');
    }
    const newUser = await userService.createUser(request.server, {username, email, password_hash, role });
    reply.status(201).send(newUser);
  },

  async getUserById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = request.params;

 
    if (request.user.role !== 'ADMIN' && request.user.id !== id) {
      throw request.server.httpErrors.forbidden('You can only view your own profile.');
    }

    const user = await userService.getUserById(request.server, id);
    if (!user) {
      throw request.server.httpErrors.notFound('User not found.');
    }
    reply.status(200).send(user);
  },

  async getAllUsers(request: FastifyRequest<{ Querystring: PaginationOptions }>, reply: FastifyReply) {

    if (request.user.role !== 'ADMIN') {
      throw request.server.httpErrors.forbidden('Only ADMIN can view all users.');
    }

    const { page = 1, limit = 10, orderBy = 'created_at', orderDirection = 'DESC' } = request.query;

    const result = await userService.getAllUsers(request.server, { page, limit, orderBy, orderDirection });
    reply.status(200).send(result);
  },

  async updateUser(request: FastifyRequest<{ Params: { id: string }; Body: UserUpdatePayload }>, reply: FastifyReply) {
    const { id } = request.params;
    const payload = request.body;


    if (request.user.role !== 'ADMIN' && request.user.id !== id) {
      throw request.server.httpErrors.forbidden('You can only update your own profile.');
    }

 
    if (request.user.role !== 'ADMIN' && payload.role !== undefined && payload.role !== request.user.role) {
      throw request.server.httpErrors.forbidden('You cannot change your own role.');
    }

    const updatedUser = await userService.updateUser(request.server, id, payload);
    if (!updatedUser) {
      throw request.server.httpErrors.notFound('User not found.');
    }
    reply.status(200).send(updatedUser);
  },

  async deleteUser(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
    const { id } = request.params;

 
    if (request.user.role !== 'ADMIN') {
      throw request.server.httpErrors.forbidden('Only ADMIN can delete users.');
    }

  
    if (request.user.id === id) {
      throw request.server.httpErrors.forbidden('You cannot delete your own user account.');
    }

    const deleted = await userService.deleteUser(request.server, id);
    if (!deleted) {
      throw request.server.httpErrors.notFound('User not found.');
    }
    reply.status(204).send(); 
  },
};