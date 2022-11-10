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
export interface JWTToken {
    header: JWTHeader;
    payload: JWTPayload;
    signature: Buffer;
}
export interface VerifyOptions {
    sig?: boolean;
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
    decoded: JWTToken;
}
declare const algorithms: readonly ["HS256", "HS384", "HS512", "RS256", "RS384", "RS512"];
declare type Algorithm = typeof algorithms[number];
declare function encode(payload: JWTPayload, key: string | Buffer, alg?: Algorithm): string;
declare function decode(encoded: string): JWTToken;
declare function verify(encoded: string, key: string | Buffer, opts?: VerifyOptions): VerifyResult;
export { encode, decode, verify, };
