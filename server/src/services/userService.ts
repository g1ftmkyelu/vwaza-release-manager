import { FastifyInstance } from 'fastify';
import { User, UserRole, PaginationOptions, PaginatedResult } from '@shared/types';
import { UserCreatePayload, UserUpdatePayload, UserWithPassword } from '../types';
import { hashPassword } from '../utils/auth';

export const userService = {
  async createUser(fastify: FastifyInstance, payload: UserCreatePayload): Promise<User> {
    const hashedPassword = await hashPassword(payload.password_hash);
    const result = await fastify.db.query(
      `INSERT INTO users (username, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, role, created_at, updated_at`,
      [payload.username, payload.email, hashedPassword, payload.role]
    );
    return result.rows[0];
  },

  async findUserByEmail(fastify: FastifyInstance, email: string): Promise<UserWithPassword | undefined> {
    const result = await fastify.db.query(
      `SELECT id, email, password_hash, role, created_at, updated_at
       FROM users
       WHERE email = $1`,
      [email]
    );
    return result.rows[0];
  },

  async getUserById(fastify: FastifyInstance, id: string): Promise<User | undefined> {
    const result = await fastify.db.query(
      `SELECT id, email, role, created_at, updated_at
       FROM users
       WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  },

  async getAllUsers(fastify: FastifyInstance, options: PaginationOptions): Promise<PaginatedResult<User>> {
    const { page = 1, limit = 10, orderBy = 'created_at', orderDirection = 'DESC' } = options; 
    const offset = (page - 1) * limit;

    const validOrderBy = ['created_at', 'email', 'role'].includes(orderBy) ? orderBy : 'created_at';
    const validOrderDirection = ['ASC', 'DESC'].includes(orderDirection) ? orderDirection : 'DESC';

    const usersQuery = `
      SELECT id, email, role, created_at, updated_at
      FROM users
      ORDER BY ${validOrderBy} ${validOrderDirection}
      LIMIT $1 OFFSET $2;
    `;

    const countQuery = `SELECT COUNT(*) FROM users;`;

    const [usersResult, countResult] = await Promise.all([
      fastify.db.query(usersQuery, [limit, offset]),
      fastify.db.query(countQuery),
    ]);

    const total = parseInt(countResult.rows[0].count, 10);

    return {
      data: usersResult.rows,
      pagination: {
        total,
        page: page,
        limit: limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async updateUser(fastify: FastifyInstance, id: string, payload: UserUpdatePayload): Promise<User | undefined> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (payload.email !== undefined) {
      updates.push(`email = $${paramIndex++}`);
      values.push(payload.email);
    }
    if (payload.password_hash !== undefined) {
      const hashedPassword = await hashPassword(payload.password_hash);
      updates.push(`password_hash = $${paramIndex++}`);
      values.push(hashedPassword);
    }
    if (payload.role !== undefined) {
      updates.push(`role = $${paramIndex++}`);
      values.push(payload.role);
    }

    if (updates.length === 0) {
      return this.getUserById(fastify, id); 
    }

    values.push(id); 
    const result = await fastify.db.query(
      `UPDATE users
       SET ${updates.join(', ')}, updated_at = NOW()
       WHERE id = $${paramIndex}
       RETURNING id, email, role, created_at, updated_at`,
      values
    );
    return result.rows[0];
  },

  async deleteUser(fastify: FastifyInstance, id: string): Promise<boolean> {
    const result = await fastify.db.query(
      `DELETE FROM users
       WHERE id = $1`,
      [id]
    );
    return result.rowCount !== null && result.rowCount > 0;
  },
};