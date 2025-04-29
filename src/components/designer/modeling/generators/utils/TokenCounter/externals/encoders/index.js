let encoderCache = new Map();
export const getEncoder = (encoderName) => {
    if (encoderCache.has(encoderName)) {
        return encoderCache.get(encoderName);
    }

    try {
        const encoder = require(`./${encoderName}.legacy`);
        encoderCache.set(encoderName, encoder);
        return encoder;
    } catch (error) {
        console.error(`Failed to load encoder ${encoderName}:`, error);
        throw error;
    }
}