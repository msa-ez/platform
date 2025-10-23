class LoggingUtil {
    constructor(namespace) {
        this.namespace = namespace || 'DEFAULT';
    }

    static makeFromNamespace(namespace) {
        return new LoggingUtil(namespace);
    }


    debug(message, ...args) {
        this._log('DEBUG', message, ...args);
    }

    info(message, ...args) {
        this._log('INFO', message, ...args);
    }

    warning(message, ...args) {
        this._log('WARNING', message, ...args);
    }

    error(message, ...args) {
        this._log('ERROR', message, ...args);
    }


    _log(level, message, ...args) {
        const time = this._getFormattedTime();
        const prefix = `[${time}][${level}][${this.namespace}]`;
        const fullMessage = `${prefix} ${message}`;
        
        switch (level) {
            case 'DEBUG':
                console.debug(fullMessage, ...args);
                break;
            case 'INFO':
                console.info(fullMessage, ...args);
                break;
            case 'WARNING':
                console.warn(fullMessage, ...args);
                break;
            case 'ERROR':
                console.error(fullMessage, ...args);
                break;
            default:
                console.log(fullMessage, ...args);
        }
    }

    _getFormattedTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
        return `${hours}:${minutes}:${seconds}.${milliseconds}`;
    }
}

module.exports = LoggingUtil;