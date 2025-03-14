class GeneratorError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

class TokenNotInputedError extends GeneratorError {
    constructor(message = "토큰 입력이 필요합니다.") {
        super(message);
    }
}

class GeneratorLockKeyError extends GeneratorError {
    constructor(message = "현재 다른 요청이 진행 중입니다. 잠시 후 다시 시도해 주세요.") {
        super(message);
    }
}

class GeneratorNetworkError extends GeneratorError {
    constructor(message, originalError = null) {
        super(message);
        this.originalError = originalError;
    }
}

module.exports = {
    GeneratorError,
    GeneratorLockKeyError,
    GeneratorNetworkError,
    TokenNotInputedError
}
