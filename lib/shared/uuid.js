/*!
 * Unified Unique ID Generator
 * Based on solution inspired by Jeff Ward and the comments to it:
 * @see http://stackoverflow.com/a/21963136/1511662
 */
const lookupTable = [];
for (let i = 0; i < 256; i++) {
    lookupTable[i] = (i < 16 ? "0" : "") + i.toString(16);
}
const rand = Math.random.bind(Math);
export function getUuid() {
    const d0 = (rand() * 4294967296) >>> 0;
    const d1 = (rand() * 4294967296) >>> 0;
    const d2 = (rand() * 4294967296) >>> 0;
    const d3 = (rand() * 4294967296) >>> 0;
    return (lookupTable[d0 & 0xff] +
        lookupTable[(d0 >> 8) & 0xff] +
        lookupTable[(d0 >> 16) & 0xff] +
        lookupTable[(d0 >> 24) & 0xff] +
        "-" +
        lookupTable[d1 & 0xff] +
        lookupTable[(d1 >> 8) & 0xff] +
        "-" +
        lookupTable[((d1 >> 16) & 0x0f) | 0x40] +
        lookupTable[(d1 >> 24) & 0xff] +
        "-" +
        lookupTable[(d2 & 0x3f) | 0x80] +
        lookupTable[(d2 >> 8) & 0xff] +
        "-" +
        lookupTable[(d2 >> 16) & 0xff] +
        lookupTable[(d2 >> 24) & 0xff] +
        lookupTable[d3 & 0xff] +
        lookupTable[(d3 >> 8) & 0xff] +
        lookupTable[(d3 >> 16) & 0xff] +
        lookupTable[(d3 >> 24) & 0xff]);
}
//# sourceMappingURL=uuid.js.map