import { hashPassword, comparePassword } from './auth';

describe('Auth Utilities', () => {
  const plainPassword = 'mySecurePassword123';
  let hashedPassword: string;

  beforeAll(async () => {
    hashedPassword = await hashPassword(plainPassword);
  });

  it('should hash a password correctly', async () => {
    expect(hashedPassword).toBeDefined();
    expect(typeof hashedPassword).toBe('string');
    expect(hashedPassword.length).toBeGreaterThan(0);
    expect(hashedPassword).not.toBe(plainPassword); // Should not be plain text
  });

  it('should compare a correct password with its hash', async () => {
    const isMatch = await comparePassword(plainPassword, hashedPassword);
    expect(isMatch).toBe(true);
  });

  it('should not compare an incorrect password with its hash', async () => {
    const isMatch = await comparePassword('wrongPassword', hashedPassword);
    expect(isMatch).toBe(false);
  });

  it('should return false for an invalid hash format', async () => {
    const isMatch = await comparePassword(plainPassword, 'invalidhash');
    expect(isMatch).toBe(false);
  });
});