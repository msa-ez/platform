const HttpUtil = require('./HttpUtil');
const fetch = require('node-fetch');

class ProxyUtil {
    /**
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     * @param {Object} options - 추가 옵션
     *        options.healthCheckUrl {String} (선택): 프록시 전 health check URL
     *        options.targetUrl {String} (필수): 최종 호출 대상 URL
     *        options.buildFetchOptions {Function}: 요청 시 사용할 fetch 옵션을 반환하는 콜백 (req를 인자로 받음)
     *        options.streamHeaders {Object} (선택): 기본 스트리밍 헤더를 덮어쓸 추가 헤더
     *        options.errorLabel {String} (필수): 로그나 에러 메시지에 사용할 엔드포인트 구분자 (예: "Ollama", "Anthropic")
     */
    static async makeProxyStream(req, res, options) {
        try {
            console.log(`Received ${options.errorLabel} request:`, {
                body: JSON.stringify(req.body),
                headers: JSON.stringify(req.headers)
            });

            if (options.healthCheckUrl) {
                const checkResponse = await fetch(options.healthCheckUrl);
                console.log(`${options.errorLabel} health check status:`, checkResponse.status);
                if (!checkResponse.ok) {
                    throw new Error(`${options.errorLabel} server check failed with status: ${checkResponse.status}`);
                }
            }


            const fetchOptions = typeof options.buildFetchOptions === 'function'
                ? options.buildFetchOptions(req)
                : options.buildFetchOptions;

            console.log(`Maked ${options.errorLabel} request:`, {
                body: JSON.stringify(fetchOptions.body),
                headers: JSON.stringify(fetchOptions.headers)
            });


            const response = await fetch(options.targetUrl, fetchOptions);
            console.log(`${options.errorLabel} API status:`, response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`${options.errorLabel} error:`, errorText);
                throw new Error(`${options.errorLabel} responded with status: ${response.status}`);
            }


            const defaultHeaders = {
                'content-type': 'text/event-stream',
                'cache-control': 'no-cache',
                'connection': 'keep-alive',
                'access-control-allow-credentials': 'true'
            };

            const streamHeaders = options.streamHeaders ? { ...defaultHeaders, ...options.streamHeaders } : defaultHeaders;
            Object.keys(streamHeaders).forEach(header => {
                res.setHeader(header, streamHeaders[header]);
            });


            response.body.pipe(res);
            response.body.on('error', (error) => {
                console.error('Stream error:', error);
                res.end();
            });
        } catch (error) {
            console.error(`${options.errorLabel} proxy error:`, error);
            res.status(500).json({ error: error.message });
        }
    }

    /**
     * @param {Object} req - Express 요청 객체
     * @param {Object} res - Express 응답 객체
     * @param {Object} options - 추가 옵션
     *        options.healthCheckUrl {String} (선택): 프록시 전 health check URL
     *        options.targetUrl {String} (필수): 최종 호출 대상 URL
     *        options.buildFetchOptions {Function}: 요청 시 사용할 fetch 옵션을 반환하는 콜백 (req를 인자로 받음)
     *        options.errorLabel {String} (필수): 로그나 에러 메시지에 사용할 엔드포인트 구분자 (예: "Ollama", "Anthropic")
     */
    static async makeProxyRequest(req, res, options) {
        try {
            console.log(`Received ${options.errorLabel} request:`, {
                body: JSON.stringify(req.body),
                headers: JSON.stringify(req.headers)
            });

            if (options.healthCheckUrl) {
                const checkResponse = await fetch(options.healthCheckUrl);
                console.log(`${options.errorLabel} health check status:`, checkResponse.status);
                if (!checkResponse.ok) {
                    throw new Error(`${options.errorLabel} server check failed with status: ${checkResponse.status}`);
                }
            }

            const fetchOptions = typeof options.buildFetchOptions === 'function'
                ? options.buildFetchOptions(req)
                : options.buildFetchOptions;

            console.log(`Making ${options.errorLabel} request:`, {
                body: JSON.stringify(fetchOptions.body),
                headers: JSON.stringify(fetchOptions.headers)
            });

            const response = await fetch(options.targetUrl, fetchOptions);
            console.log(`${options.errorLabel} API status:`, response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`${options.errorLabel} error:`, errorText);
                throw new Error(`${options.errorLabel} responded with status: ${response.status}`);
            }

            const responseData = await response.text();
            
            for (const [key, value] of response.headers.entries()) {
                // 컨텐츠를 이미 해독해서 text()로 변환해서 반환하므로, 이 헤더가 포함되면 문제가 생길 수 있음음
                if (key.toLowerCase() !== 'content-encoding') {
                    res.setHeader(key, value);
                }
            }
            
            HttpUtil.setCorsHeaders(req, res);
            
            res.status(response.status).send(responseData);
        } catch (error) {
            console.error(`${options.errorLabel} proxy error:`, error);
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = ProxyUtil;