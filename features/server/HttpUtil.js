const { headersToAllow, allowedOrigins } = require('./constants');
const https = require('https')

class HttpUtil {
    static setCorsHeaders(req, res) {
        res.header('access-control-allow-headers', headersToAllow.join(', '));

        const origin = req.headers.origin
        if (allowedOrigins.includes(origin))
            res.header('access-control-allow-origin', origin);
        else
            res.header('access-control-allow-origin', 'http://www.msaez.io:8081');

        res.header('access-control-allow-methods', 'GET, POST, OPTIONS');
        res.header('access-control-allow-credentials', 'true');
    }

    static createHttpsAgent(rejectUnauthorized = false) {
        return new https.Agent({ rejectUnauthorized });
    }
}

module.exports = HttpUtil;