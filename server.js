require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const Pusher = require('pusher');
const { ConfigUtil, HttpUtil, ProxyUtil, TokenizerUtil, NodeUtil } = require('./features/server');


NodeUtil.checkNodeVersion(process.version, 'v20.17.0');

const config = ConfigUtil.initializeConfig();


const port = config.server.port;
const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: 'ap3',
});

const app = express();
app.use(bodyParser.json());
app.use((req, res, next) => {
    HttpUtil.setCorsHeaders(req, res);

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

        await ProxyUtil.makeProxyStream(req, res, {
            healthCheckUrl: healthCheckUrl,
            targetUrl: targetUrl,
            buildFetchOptions: (req) => {
                return {
                    method: method,
                    headers: customHeaders,
                    body: (method === "GET") ? undefined : JSON.stringify(req.body),
                    agent: isUseAgent ? HttpUtil.createHttpsAgent(rejectUnauthorized) : undefined
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
        await ProxyUtil.makeProxyRequest(req, res, {
            healthCheckUrl: healthCheckUrl,
            targetUrl: targetUrl,
            buildFetchOptions: (req) => {
                return {
                    method: method,
                    headers: customHeaders,
                    body: (method === "GET") ? undefined : JSON.stringify(req.body),
                    agent: isUseAgent ? HttpUtil.createHttpsAgent(rejectUnauthorized) : undefined
                };
            },
            errorLabel: errorLabel
        });
    } catch (error) {
        console.error('Proxy request error:', error);
        res.status(500).json({ error: error.message });
    }
})

app.post('/llm/count-tokens', async (req, res) => {
    const { text, model } = req.body;
    const result = await TokenizerUtil.countTokens(text, model, config.tokenizer.useOfflineTokenizer);
    if (result.error) {
        res.status(400).json({ error: result.error })
        return;
    }

    res.json({ tokenCount: result.tokenCount });
});