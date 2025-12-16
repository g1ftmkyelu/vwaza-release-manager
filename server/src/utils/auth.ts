import bcrypt from 'bcrypt';
import { FastifyInstance } from 'fastify';
import { AuthenticatedUser } from '@shared/types';
import { UserWithPassword } from '../types';

const SALT_ROUNDS = 10;

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const generateToken = async (fastify: FastifyInstance, user: AuthenticatedUser): Promise<string> => {
  return fastify.jwt.sign(user, { expiresIn: '7d' });
};