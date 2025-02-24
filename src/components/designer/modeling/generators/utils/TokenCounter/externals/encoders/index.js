/**
 * @note encoderName: cl100k_base | o200k_base | p50k_base | p50k_edit | r50k_base
 */
export const getEncoder = (encoderName) => {
    const encoder = require(`./${encoderName}.legacy`);
    return encoder;
}