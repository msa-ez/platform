const { openaiEncoderMap } = require("./constants");
const { getEncoder } = require("../externals");

class OpenAITokenCounter {
    static async getTokenCount(text, model) {
        let encoderName = null;
        for (const [pattern, name] of Object.entries(openaiEncoderMap)) {
            if (new RegExp(pattern, 'i').test(model)) {
                encoderName = name;
                break;
            }
        }
        if (!encoderName) throw new Error(`[!] Unknown model "${model}".`);

        const encoder = getEncoder(encoderName);
        return encoder.encode(text).length;
    }
}

module.exports = OpenAITokenCounter;