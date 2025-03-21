require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const Pusher = require('pusher');
const https = require('https')

const port = process.env.PORT || 4000;
const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: 'ap3',
});

const app = express();
app.use(bodyParser.json());
app.use((req, res, next) => {
    Util.setCorsHeaders(req, res);

    if (req.method === 'OPTIONS')
        return res.status(200).end();
    
    next();
});

app.use(bodyParser.urlencoded({extended: true}));

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});

// app.post('/paint', (req, res) => {
//     pusher.trigger('painting', 'draw', req.body);
//     res.json(req.body);
// });

app.post('/payments/complete', async (req, res) => {
    try {
        console.log('CHECKCCC',req.body)
        const {imp_uid, merchant_uid} = req.body;

        const amountToBePaid = 100;

        // 결제 검증하기
        const {amount, status} = paymentData;
        if (amount === amountToBePaid) {
            // 결제 금액 일치
        } else {
            throw {status: "forgery", message: "위조된 결제시도"};
        }
    } catch (e) {
        res.status(400).send(e);
    }
});


// ### 프록시 연결을 구축하기 위한 엔드포인트들 ###

app.post('/proxy/stream', async (req, res) => {
    try {
        const targetUrl = req.headers["param-url"];
        if (!targetUrl) {
            return res.status(400).json({ error: "param-url 헤더가 필요합니다" });
        }

        let customHeaders = {};
        if (req.headers["param-headers"]) {
            try {
                customHeaders = JSON.parse(req.headers["param-headers"]);
            } catch (e) {
                return res.status(400).json({ error: "param-headers는 유효한 JSON 형식이어야 합니다" });
            }
        }

        const healthCheckUrl = req.headers["param-health-check-url"];
        const errorLabel = req.headers["param-error-label"] || "Generic Proxy";
        const rejectUnauthorized = req.headers["param-reject-unauthorized"] !== "false";
        const isUseAgent = req.headers["param-is-use-agent"] !== "false";
        const method = req.headers["param-method"] || "POST";

        await Util.makeProxyStream(req, res, {
            healthCheckUrl: healthCheckUrl,
            targetUrl: targetUrl,
            buildFetchOptions: (req) => {
                return {
                    method: method,
                    headers: customHeaders,
                    body: (method === "GET") ? undefined : JSON.stringify(req.body),
                    agent: isUseAgent ? Util.createHttpsAgent(rejectUnauthorized) : undefined
                };
            },
            errorLabel: errorLabel
        });
    } catch (error) {
        console.error('Proxy stream error:', error);
        res.status(500).json({ error: error.message });
    }
})

app.post('/proxy/request', async (req, res) => {
    try {
        const targetUrl = req.headers["param-url"];
        if (!targetUrl) {
            return res.status(400).json({ error: "param-url 헤더가 필요합니다" });
        }

        let customHeaders = {};
        if (req.headers["param-headers"]) {
            try {
                customHeaders = JSON.parse(req.headers["param-headers"]);
            } catch (e) {
                return res.status(400).json({ error: "param-headers는 유효한 JSON 형식이어야 합니다" });
            }
        }

        const healthCheckUrl = req.headers["param-health-check-url"];
        const errorLabel = req.headers["param-error-label"] || "Generic Proxy";
        const rejectUnauthorized = req.headers["param-reject-unauthorized"] !== "false";
        const isUseAgent = req.headers["param-is-use-agent"] !== "false";
        const method = req.headers["param-method"] || "POST";
        await Util.makeProxyRequest(req, res, {
            healthCheckUrl: healthCheckUrl,
            targetUrl: targetUrl,
            buildFetchOptions: (req) => {
                return {
                    method: method,
                    headers: customHeaders,
                    body: (method === "GET") ? undefined : JSON.stringify(req.body),
                    agent: isUseAgent ? Util.createHttpsAgent(rejectUnauthorized) : undefined
                };
            },
            errorLabel: errorLabel
        });
    } catch (error) {
        console.error('Proxy request error:', error);
        res.status(500).json({ error: error.message });
    }
})

class Util {
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
                res.setHeader(key, value);
            }
            
            Util.setCorsHeaders(req, res);
            
            res.status(response.status).send(responseData);
        } catch (error) {
            console.error(`${options.errorLabel} proxy error:`, error);
            res.status(500).json({ error: error.message });
        }
    }

    static setCorsHeaders(req, res) {
        const headersToAllow = [
            "origin",
            "x-requested-with",
            "content-type",
            "accept",
            "authorization",
            "param-url",
            "param-headers",
            "param-health-check-url",
            "param-error-label",
            "param-reject-unauthorized",
            "param-is-use-agent",
            "param-method"
        ]

        res.header('access-control-allow-headers', headersToAllow.join(', '));


        const allowedOrigins = ['http://www.msaez.io:8081', 'https://www.msaez.io:8081', 'http://localhost:8081'];
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