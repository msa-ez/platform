require('dotenv').config();
var bodyParser = require('body-parser');
const fetch = require('node-fetch');
const express = require('express');
const app = express();
const Pusher = require('pusher');
app.use(bodyParser.json());

const port = process.env.PORT || 4000;
const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: 'ap3',
});

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://www.msaez.io:8081');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    // OPTIONS 요청 처리
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    next();
});

app.use(bodyParser.urlencoded({extended: true}));

// 서버 상태 확인용 엔드포인트
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Ollama 프록시 엔드포인트
app.post('/api/ollama/chat', async (req, res) => {
    console.log('Received request:', req.body);

    try {
        // health check 대신 models API 사용
        const modelCheck = await fetch('http://127.0.0.1:11434/api/tags');
        console.log('Models check status:', modelCheck.status);
        
        if (!modelCheck.ok) {
            throw new Error(`Ollama server check failed with status: ${modelCheck.status}`);
        }

        // Ollama API 호출
        const response = await fetch('http://127.0.0.1:11434/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req.body)
        });

        console.log('Chat API status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Ollama error:', errorText);
            throw new Error(`Ollama responded with status: ${response.status}`);
        }

        // 스트림 헤더 설정
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Access-Control-Allow-Origin', 'https://www.msaez.io:8081');
        res.setHeader('Access-Control-Allow-Credentials', 'true');

        // Ollama 응답을 클라이언트로 스트리밍
        response.body.pipe(res);

        response.body.on('error', (error) => {
            console.error('Stream error:', error);
            res.end();
        });

    } catch (error) {
        console.error('Ollama proxy error:', error);
        res.status(500).json({ error: error.message });
    }
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
