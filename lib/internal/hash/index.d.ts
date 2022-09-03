declare type Algorithm = "sha256" | "sha512";
export declare class Hasher {
    private algorithm;
    private saltLength;
    constructor(algorithm?: Algorithm, saltLength?: number);
    verify(encoded: string, unencoded: string): boolean;
    encode(string: string): string;
    hash(string: string, algorithm: Algorithm, salt: string): string;
    parse(encoded: string): {
        algorithm: Algorithm;
        salt: string;
        digest: string;
    };
}
export declare const hash: Hasher;
export {};
