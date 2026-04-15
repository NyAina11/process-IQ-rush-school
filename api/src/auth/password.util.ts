import { randomBytes, scryptSync, timingSafeEqual } from 'crypto';

const PREFIX = 'scrypt';

export const hashPassword = (plain: string): string => {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(plain, salt, 64).toString('hex');
  return `${PREFIX}$${salt}$${hash}`;
};

export const verifyPassword = (plain: string, stored: string): boolean => {
  if (!stored) return false;
  const parts = stored.split('$');
  if (parts.length !== 3 || parts[0] !== PREFIX) {
    // Backward compatibility with legacy plain-text records
    return plain === stored;
  }

  const [, salt, hashHex] = parts;
  const expected = Buffer.from(hashHex, 'hex');
  const actual = scryptSync(plain, salt, 64);
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
};
