import crypto from "node:crypto";
import { derToJose, joseToDer } from "ecdsa-sig-formatter";
const algorithms = [
    "HS256",
    "HS384",
    "HS512",
    "RS256",
    "RS384",
    "RS512",
];
function isValidAlgorithm(alg) {
    return algorithms.includes(alg);
}
const Algorithms = {
    HS256: createHmac(256),
    HS384: createHmac(384),
    HS512: createHmac(512),
    RS256: createSign(256),
    RS384: createSign(384),
    RS512: createSign(512),
    ES256: createEcdsa(256),
};
function createHmac(bits) {
    function sign(encoded, secret) {
        return crypto
            .createHmac(`sha${bits}`, secret)
            .update(encoded)
            .digest("base64");
    }
    function verify(encoded, signature, secret) {
        return sign(encoded, secret) === signature;
    }
    return { sign, verify };
}
function createSign(bits) {
    const algorithm = `RSA-SHA${bits}`;
    function sign(encoded, secret) {
        return crypto
            .createSign(algorithm)
            .update(encoded)
            .sign(secret.toString(), "base64");
    }
    function verify(encoded, signature, secret) {
        const v = crypto.createVerify(algorithm);
        v.update(encoded);
        return v.verify(secret, signature, "base64");
    }
    return { sign, verify };
}
function createEcdsa(bits) {
    const algorithm = `RSA-SHA${bits}`;
    function sign(encoded, secret) {
        const sig = crypto
            .createSign(algorithm)
            .update(encoded)
            .sign({ key: secret.toString() }, "base64");
        return derToJose(sig, `ES${bits}`);
    }
    function verify(encoded, signature, secret) {
        signature = joseToDer(signature, `ES${bits}`).toString("base64");
        const v = crypto.createVerify(algorithm);
        v.update(encoded);
        return v.verify(secret, signature, "base64");
    }
    return { sign, verify };
}
function encodeJSONBase64(obj) {
    const j = JSON.stringify(obj);
    return Base64ToURLEncoded(Buffer.from(j).toString("base64"));
}
function decodeJSONBase64(str) {
    const dec = Buffer.from(URLEncodedToBase64(str), "base64").toString("utf-8");
    try {
        return JSON.parse(dec);
    }
    catch (e) {
        console.warn("Failed to parse JSON", dec, e);
        return dec;
    }
}
function Base64ToURLEncoded(b64) {
    return b64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
function URLEncodedToBase64(enc) {
    enc = enc.toString();
    const pad = 4 - (enc.length % 4);
    if (pad !== 4) {
        for (let i = 0; i < pad; i++) {
            enc += "=";
        }
    }
    return enc.replace(/\-/g, "+").replace(/_/g, "/");
}
/**
 * Encodes a payload into a JWT string with a specified algorithm.
 *
 * @param {JWTPayload} payload - The payload to encode into the JWT.
 * @param {string | Buffer} key - The secret key used to sign the JWT.
 * @param {Algorithm} alg - The algorithm used to sign the JWT. Defaults to "HS256".
 * @throws {Error} If an invalid algorithm type is provided.
 * @returns {string} The encoded JWT string.
 */
function encode(payload, key, alg = "HS256") {
    if (!isValidAlgorithm(alg)) {
        throw new Error(`${alg} is an invalid algorithm type. Must be one of ${algorithms}`);
    }
    const b64header = encodeJSONBase64({ alg, type: "JWT" });
    const b64payload = encodeJSONBase64(payload);
    const unsigned = `${b64header}.${b64payload}`;
    const signer = Algorithms[alg];
    const sig = Base64ToURLEncoded(signer.sign(unsigned, key));
    return `${unsigned}.${sig}`;
}
/**
 * Decodes a JWT-encoded string and returns an object containing the decoded header, payload, and signature.
 *
 * @param {string} encoded - The JWT-encoded string to decode.
 * @throws {Error} If the encoded string does not have exactly three parts separated by periods.
 * @returns {JWTParts} An object containing the decoded header, payload, and signature of the token.
 */
function decode(encoded) {
    const parts = encoded.split(".");
    if (parts.length !== 3) {
        throw new Error(`Decode expected 3 parts to encoded token, got ${parts.length}`);
    }
    const header = decodeJSONBase64(parts[0]);
    const payload = decodeJSONBase64(parts[1]);
    const signature = Buffer.from(URLEncodedToBase64(parts[2]), "base64");
    return { header, payload, signature };
}
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
function verify(encoded, key, opts = {}) {
    const decoded = decode(encoded);
    const { payload } = decoded;
    const parts = encoded.split(".");
    const alg = opts.alg ?? decoded.header.alg;
    const now = Date.now();
    const verifier = Algorithms[alg];
    const result = { decoded };
    result.sig = verifier.verify(`${parts[0]}.${parts[1]}`, URLEncodedToBase64(parts[2]), key);
    if (payload.exp !== undefined) {
        result.exp = payload.exp < now;
    }
    if (payload.nbf !== undefined) {
        result.nbf = now >= payload.nbf;
    }
    if (opts.iat !== undefined) {
        result.iat = payload.iat === opts.iat;
    }
    if (opts.iss !== undefined) {
        result.iss = payload.iss === opts.iss;
    }
    if (opts.jti !== undefined) {
        result.jti = payload.jti !== opts.jti;
    }
    if (opts.sub !== undefined) {
        result.sub = payload.sub === opts.sub;
    }
    if (opts.aud !== undefined) {
        result.aud = payload.aud === opts.aud;
    }
    return result;
}
export { encode, decode, verify, };
//# sourceMappingURL=index.js.map