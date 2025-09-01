// fast-png 모듈 스텁 - 빌드 오류 방지용
const fastPng = {
  decode: function(buffer) {
    console.warn('fast-png decode function called but not implemented');
    return null;
  },
  encode: function(data) {
    console.warn('fast-png encode function called but not implemented');
    return null;
  }
};

// CommonJS와 ES6 모듈 모두 지원
if (typeof module !== 'undefined' && module.exports) {
  module.exports = fastPng;
  module.exports.default = fastPng;
  module.exports.decode = fastPng.decode;
  module.exports.encode = fastPng.encode;
}

export default fastPng;
export const decode = fastPng.decode;
export const encode = fastPng.encode;
