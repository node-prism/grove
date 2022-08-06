const isProduction = process.env.NODE_ENV === "production";
const prefix = "Invariant failed";
export function invariant(condition, message) {
    if (condition)
        return;
    if (isProduction)
        throw new Error(prefix);
    const provided = typeof message === "function" ? message() : message;
    const out = provided ? `${prefix}: ${provided}` : prefix;
    throw new Error(out);
}
export async function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
//# sourceMappingURL=utils.js.map