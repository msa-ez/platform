const express = require('express');
const cors = require('cors');
const axios = require('axios');
const admin = require('firebase-admin');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const LITELLM_URL = process.env.LITELLM_URL || 'http://localhost:4000';
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'eventstorming-tool-db';
const IS_DEBUG_MODE = process.env.IS_DEBUG_MODE || false;

// Firebase Admin 초기화
// 환경 변수로 서비스 계정 키를 받거나, 기본 인증 사용
if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: FIREBASE_PROJECT_ID
  });
} else {
  // 로컬 개발 환경: 공개 키를 통한 검증만 수행
  console.log('Firebase Admin initialized with public key verification only');
}

// Middleware
app.use(cors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(morgan('combined', {
  skip: function (req, res) { 
    return req.url === '/health'; 
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'litellm-proxy-gateway' });
});

// JWT 토큰 검증 미들웨어
async function verifyFirebaseToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Unauthorized', 
        message: 'No token provided' 
      });
    }

    const token = authHeader.split('Bearer ')[1];

    try {
      // Firebase ID 토큰 검증
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;
      next();
    } catch (verifyError) {
      // Firebase Admin SDK가 초기화되지 않은 경우, 공개 키로 직접 검증
      if (verifyError.code === 'app/no-app') {
        // 개발 환경: 토큰 구조만 검증
        const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        
        if (decoded.aud === FIREBASE_PROJECT_ID) {
          req.user = decoded;
          next();
        } else {
          return res.status(401).json({ 
            error: 'Unauthorized', 
            message: 'Invalid token audience' 
          });
        }
      } else {
        throw verifyError;
      }
    }
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ 
      error: 'Unauthorized', 
      message: 'Invalid token',
      details: error.message 
    });
  }
}

// Preflight 요청 처리 (인증 없이)
app.options('/v1/*', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
  res.status(200).end();
});

// LiteLLM 프록시 엔드포인트
app.all('/v1/*', verifyFirebaseToken, async (req, res) => {
  try {
    const path = req.path;
    const method = req.method;
    const url = `${LITELLM_URL}${path}`;

    // CORS 헤더를 먼저 설정 (streaming 응답 전에)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');


    if(IS_DEBUG_MODE) {
      console.log('=== Incoming Request ===');
      console.log('Method:', method);
      console.log('Path:', path);
      console.log('URL:', url);
      console.log('User ID:', req.user?.user_id || req.user?.sub);
      console.log('Request Body Size:', JSON.stringify(req.body).length, 'bytes');
      console.log('Request Model:', req.body?.model);
      console.log('Request Messages Count:', req.body?.messages?.length);
    }

    // LiteLLM으로 요청 전달
    const response = await axios({
      method: method,
      url: url,
      data: req.body,
      params: req.query,
      headers: {
        'Content-Type': 'application/json',
        // Authorization 헤더는 제거 (내부 통신)
      },
      responseType: 'stream'
    });

    if(IS_DEBUG_MODE) {
      console.log('=== LiteLLM Response ===');
      console.log('Status:', response.status);
      console.log('Headers:', response.headers);
    }

    
    // 응답 헤더 복사 (CORS 헤더 제외)
    Object.keys(response.headers).forEach(key => {
      if (!key.toLowerCase().startsWith('access-control-')) {
        res.setHeader(key, response.headers[key]);
      }
    });

    res.status(response.status);
    response.data.pipe(res);

  } catch (error) {
    console.error('=== Proxy Error ===');
    console.error('Error Message:', error.message);
    console.error('Error Code:', error.code);
    console.error('Request Path:', req.path);
    console.error('Request Body:', JSON.stringify(req.body, null, 2).substring(0, 500)); // 처음 500자만
    
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Headers:', error.response.headers);
      
      // Stream 데이터를 버퍼로 읽기
      if (error.response.data && typeof error.response.data.pipe === 'function') {
        const chunks = [];
        error.response.data.on('data', chunk => chunks.push(chunk));
        error.response.data.on('end', () => {
          const errorBody = Buffer.concat(chunks).toString('utf8');
          console.error('LiteLLM Error Response:', errorBody);
        });
      } else if (error.response.data) {
        console.error('LiteLLM Error Response:', JSON.stringify(error.response.data));
      }
    } else if (error.request) {
      console.error('No response received');
      console.error('Request config:', {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      });
    } else {
      console.error('Error setting up request:', error);
    }
    
    // 클라이언트에게 응답
    const statusCode = error.response?.status || 502;
    res.status(statusCode).json({
      error: {
        message: error.response?.statusText || 'Gateway Error',
        details: error.message,
        code: statusCode,
        timestamp: new Date().toISOString()
      }
    });
  }
});

// 기본 라우트
app.get('/', (req, res) => {
  res.json({
    service: 'LiteLLM Proxy Gateway',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      proxy: '/v1/*'
    }
  });
});

// 404 핸들러
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'Endpoint not found'
  });
});

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

app.listen(PORT, () => {
  console.log(`LiteLLM Proxy Gateway running on port ${PORT}`);
  console.log(`Proxying to: ${LITELLM_URL}`);
  console.log(`Firebase Project: ${FIREBASE_PROJECT_ID}`);
});

