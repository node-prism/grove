import { expect, testSuite } from "manten";
import { Hasher } from "src/internal/hash";

export default testSuite(async ({ describe }) => {

  describe("encode", ({ test }) => {
    test('returns a string that is not the same as the input string', () => {
      const hasher = new Hasher();
      const input = 'password';
      const encoded = hasher.encode(input);
      expect(encoded).not.toBe(input);
    });

    test('returns a string composed of three parts separated by colons', () => {
      const hasher = new Hasher();
      const encoded = hasher.encode('password');
      const parts = encoded.split(':');
      expect(parts.length).toBe(3);
    });

  });

  describe('verify', ({ test }) => {
    test('returns true for a valid input', () => {
      const hasher = new Hasher();
      const password = 'password';
      const encoded = hasher.encode(password);
      const isValid = hasher.verify(encoded, password);
      expect(isValid).toBe(true);
    });

    test('returns false for an invalid input', () => {
      const hasher = new Hasher();
      const password = 'password';
      const encoded = hasher.encode(password);
      const isValid = hasher.verify(encoded, 'wrongpassword');
      expect(isValid).toBe(false);
    });

    test('throws an error for an invalid hash string', () => {
      const hasher = new Hasher();
      const invalidHash = 'invalid-hash';
      expect(() => hasher.verify(invalidHash, 'password')).toThrowError('Invalid hash string');
    });
  });

  describe('hash', ({ test }) => {
    test('returns a string composed of three parts separated by colons', () => {
      const hasher = new Hasher();
      const hash = hasher.hash('password', 'sha256', 'salt');
      const parts = hash.split(':');
      expect(parts.length).toBe(3);
    });
  });

});
