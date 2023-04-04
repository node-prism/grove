import { expect, testSuite } from "manten";
import { JWTPayload, decode, encode } from "src/internal/jwt";

export default testSuite(async ({ describe }) => {

  describe("encoding/decoding", ({ test }) => {
    const payload: JWTPayload = { sub: "1234567890", name: "John Doe", iat: 1516239022 };
    const key = "mysecretkey";

    test("should correctly encode and decode a JWT token with default algorithm", () => {
      const encoded = encode(payload, key);
      const decoded = decode(encoded);

      expect(decoded.header.alg).toBe("HS256");
      expect(decoded.header.type).toBe("JWT");
      expect(decoded.payload).toEqual(payload);
    });

    test("should correctly encode and decode a JWT token with specified algorithm", () => {
      const encoded = encode(payload, key, "HS512");
      const decoded = decode(encoded);

      expect(decoded.header.alg).toBe("HS512");
      expect(decoded.header.type).toBe("JWT");
      expect(decoded.payload).toEqual(payload);
    });

    test("should throw an error when invalid algorithm is provided", () => {
      // @ts-ignore
      expect(() => encode(payload, key, "invalid-alg")).toThrowError("invalid-alg is an invalid algorithm type. Must be one of HS256,HS384,HS512,RS256,RS384,RS512");
    });

    test("should throw an error when encoded token doesn't have 3 parts", () => {
      expect(() => decode("invalid-token")).toThrowError("Decode expected 3 parts to encoded token, got 1");
    });

  });

});

