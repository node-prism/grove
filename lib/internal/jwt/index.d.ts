/// <reference types="node" />
export interface JWTPayload {
    /** expiration */
    exp?: number;
    /** subject */
    sub?: string | number;
    /** issued at */
    iat?: number;
    /** not before */
    nbf?: number;
    /** jwt id */
    jti?: number;
    /** issuer */
    iss?: string;
    /** audience */
    aud?: string | number;
    /** whatever */
    [k: string]: any;
}
export interface JWTHeader {
    /** encoding alg used */
    alg: string;
    /** token type */
    type: "JWT";
    /** key id */
    kid?: string;
}
export interface JWTParts {
    header: JWTHeader;
    payload: JWTPayload;
    signature: Buffer;
}
export interface VerifyOptions {
    alg?: string;
    exp?: boolean;
    sub?: string | number;
    iat?: number;
    nbf?: boolean;
    jti?: number;
    iss?: string;
    aud?: string | number;
}
export interface VerifyResult {
    /** true: signature is valid */
    sig?: boolean;
    /** true: payload.iat matches opts.iat */
    iat?: boolean;
    /** true: the current time is later or equal to payload.nbf, false: this jwt should NOT be accepted */
    nbf?: boolean;
    /** true: token is expired (payload.exp < now) */
    exp?: boolean;
    /** true: payload.jti matches opts.jti */
    jti?: boolean;
    /** true: payload.iss matches opts.iss */
    iss?: boolean;
    /** true: payload.sub matches opts.sub */
    sub?: boolean;
    /** true: payload.aud matches opts.aud */
    aud?: boolean;
    decoded: JWTParts;
}
declare const algorithms: readonly ["HS256", "HS384", "HS512", "RS256", "RS384", "RS512"];
declare type Algorithm = typeof algorithms[number];
/**
 * Encodes a payload into a JWT string with a specified algorithm.
 *
 * @param {JWTPayload} payload - The payload to encode into the JWT.
 * @param {string | Buffer} key - The secret key used to sign the JWT.
 * @param {Algorithm} alg - The algorithm used to sign the JWT. Defaults to "HS256".
 * @throws {Error} If an invalid algorithm type is provided.
 * @returns {string} The encoded JWT string.
 */
declare function encode(payload: JWTPayload, key: string | Buffer, alg?: Algorithm): string;
/**
 * Decodes a JWT-encoded string and returns an object containing the decoded header, payload, and signature.
 *
 * @param {string} encoded - The JWT-encoded string to decode.
 * @throws {Error} If the encoded string does not have exactly three parts separated by periods.
 * @returns {JWTParts} An object containing the decoded header, payload, and signature of the token.
 */
declare function decode(encoded: string): JWTParts;
/**
 * Verifies an encoded token with the given secret key and options.
 * @param encoded
 * @param key Secret key used to verify the signature of the encoded token.
 * @param opts The opts parameter of the verify function is an optional object that can contain the following properties:
 * - alg: A string specifying the algorithm used to sign the token. If this property is not present in opts, the alg property from the decoded token header will be used.
 * - iat: A number representing the timestamp when the token was issued. If present, this property will be compared to the iat claim in the token's payload.
 * - iss: A string representing the issuer of the token. If present, this property will be compared to the iss claim in the token's payload.
 * - jti: A string representing the ID of the token. If present, this property will be compared to the jti claim in the token's payload.
 * - sub: A string representing the subject of the token. If present, this property will be compared to the sub claim in the token's payload.
 * - aud: A string or number representing the intended audience(s) for the token. If present, this property will be compared to the aud claim in the token's payload.
 * @returns
 */
declare function verify(encoded: string, key: string | Buffer, opts?: VerifyOptions): VerifyResult;
export { encode, decode, verify, };
