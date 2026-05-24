import Sqids from "sqids";

// Initialize Sqids with a secure, custom alphabet and minimum length
const sqids = new Sqids({
    minLength: 8,
    alphabet: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
});

/**
 * Obfuscates a single positive numeric ID or MongoDB Auto-increment index into a short Sqids string.
 * @param {number} numericId - The database index or auto-incrementing ID.
 * @returns {string} The obfuscated Sqids token.
 */
export const obfuscateId = (numericId) => {
    if (typeof numericId !== "number" || numericId < 0) {
        throw new Error("Only valid non-negative numbers can be obfuscated.");
    }
    return sqids.encode([numericId]);
};

/**
 * Decodes an obfuscated Sqids token back into its original positive numeric ID.
 * @param {string} sqidString - The obfuscated token string.
 * @returns {number|null} The decoded numeric ID, or null if invalid/decoding failed.
 */
export const deobfuscateId = (sqidString) => {
    if (typeof sqidString !== "string") {
        return null;
    }
    try {
        const result = sqids.decode(sqidString);
        return result.length > 0 ? result[0] : null;
    } catch (error) {
        return null;
    }
};
