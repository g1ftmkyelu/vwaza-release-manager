import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { AuthPayload, AuthenticatedUser } from '@shared/types';
import { UserCreatePayload, UserWithPassword } from '../types';
import { userService } from '../services/userService';
import { comparePassword, generateToken } from '../utils/auth';

export const authController = {
  async register(request: FastifyRequest<{ Body: UserCreatePayload }>, reply: FastifyReply) {
    const { username, email, password_hash, role } = request.body;

    if (!email || !password_hash || !role) {
      throw request.server.httpErrors.badRequest('Email, password, and role are required.');
    }

    const existingUser = await userService.findUserByEmail(request.server, email);
    if (existingUser) {
      throw request.server.httpErrors.conflict('User with this email already exists.');
    }

    const newUser = await userService.createUser(request.server, {username, email, password_hash, role });
    const token = await generateToken(request.server, { id: newUser.id, username:newUser.username, email: newUser.email, role: newUser.role });

    reply.status(201).send({ message: 'User registered successfully', user: { id: newUser.id, email: newUser.email, role: newUser.role }, token });
  },

  async login(request: FastifyRequest<{ Body: AuthPayload }>, reply: FastifyReply) {
    const { email, password_hash } = request.body;

    if (!email || !password_hash) {
      throw request.server.httpErrors.badRequest('Email and password are required.');
    }

    const user: UserWithPassword | undefined = await userService.findUserByEmail(request.server, email);
    if (!user) {
      throw request.server.httpErrors.unauthorized('Invalid credentials.');
    }

    const isPasswordValid = await comparePassword(password_hash, user.password_hash);
    if (!isPasswordValid) {
      throw request.server.httpErrors.unauthorized('Invalid credentials.');
    }

    const token = await generateToken(request.server, { id: user.id, email: user.email, role: user.role });

    reply.status(200).send({ message: 'Logged in successfully', user: { id: user.id, email: user.email, role: user.role }, token });
  },
};