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
    Util.setCorsHeaders(res);

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


// ### AI 모델 서버 통신용 프록시 엔드 포인트들 ###

app.post('/api/ollama/chat', async (req, res) => {
    await Util.makeProxyStream(req, res, {
        healthCheckUrl: 'http://127.0.0.1:11434/api/tags',
        targetUrl: 'http://127.0.0.1:11434/api/chat',
        buildFetchOptions: (req) => ({
            method: 'POST',
            headers: {
                'content-type': 'application/json',
            },
            body: JSON.stringify(req.body)
        }),
        errorLabel: 'Ollama'
    })
});

app.post('/api/anthropic/chat', async (req, res) => {
    await Util.makeProxyStream(req, res, {
        targetUrl: 'https://api.anthropic.com/v1/messages',
        buildFetchOptions: (req) => {
            return {
                method: 'POST',
                headers: {
                    "content-type": req.headers["content-type"] || "application/json",
                    "anthropic-version": req.headers["anthropic-version"] || "2023-06-01",
                    "x-api-key": req.headers["x-api-key"],
                    "user-agent": req.headers["user-agent"] || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
                },
                body: JSON.stringify(req.body),
                agent: Util.createHttpsAgent(false)
            };
        },
        errorLabel: 'Anthropic'
    });
});

app.post('/api/openai-compatibility/chat', async (req, res) => {
    await Util.makeProxyStream(req, res, {
        targetUrl: req.headers["ai-param-url"],
        buildFetchOptions: (req) => {
            return {
                method: 'POST',
                headers: {
                    "content-type": req.headers["content-type"] || "application/json",
                    "user-agent": req.headers["user-agent"] || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
                    "authorization": req.headers["authorization"]
                },
                body: JSON.stringify(req.body),
                agent: Util.createHttpsAgent(false)
            };
        },
        errorLabel: 'OpenAI Compatibility'
    });
});


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
                'access-control-allow-origin': 'https://www.msaez.io:8081',
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

    static setCorsHeaders(res) {
        const headersToAllow = [
            "origin",
            "x-requested-with",
            "content-type",
            "accept",
            "anthropic-version",
            "x-api-key",
            "ai-param-url",
            "authorization"
        ]

        res.header('access-control-allow-origin', 'https://www.msaez.io:8081');
        res.header('access-control-allow-methods', 'GET, POST, OPTIONS');
        res.header('access-control-allow-headers', headersToAllow.join(', '));
        res.header('access-control-allow-credentials', 'true');
    }

    static createHttpsAgent(rejectUnauthorized = false) {
        return new https.Agent({ rejectUnauthorized });
    }
}