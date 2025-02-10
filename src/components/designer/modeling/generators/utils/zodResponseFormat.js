const { zodToJsonSchema } = require("zod-to-json-schema");

function zodResponseFormat(zodObject, name, requirePropsToDelete=[]) {
    const zodRespose = (0, makeParseableResponseFormat)({
        type: 'json_schema',
        json_schema: {
            name,
            strict: true,
            schema: (0, zodToJsonSchema)(zodObject, { openaiStrictMode: true })
        },
    }, (content) => zodObject.parse(JSON.parse(content)));

    function removePropertiesFromRequired(obj, keysToRemove) {
        if (Array.isArray(obj)) {
            obj.forEach(item => removePropertiesFromRequired(item, keysToRemove));
        } else if (obj !== null && typeof obj === 'object') {
            if (Array.isArray(obj.required)) {
                obj.required = obj.required.filter(key => !keysToRemove.includes(key));
            }
            Object.keys(obj).forEach(key => removePropertiesFromRequired(obj[key], keysToRemove));
        }
    }
    removePropertiesFromRequired(zodRespose, requirePropsToDelete);
    return zodRespose;
}

function makeParseableResponseFormat(response_format, parser) {
    const obj = { ...response_format };
    Object.defineProperties(obj, {
        $brand: {
            value: 'auto-parseable-response-format',
            enumerable: false,
        },
        $parseRaw: {
            value: parser,
            enumerable: false,
        },
    });
    return obj;
}

module.exports = zodResponseFormat;