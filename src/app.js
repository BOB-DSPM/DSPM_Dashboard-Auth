require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { initializeFirebase } = require('./config/firebase');

// Firebase 초기화
initializeFirebase();

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15분
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100 // 요청 제한
});

// 미들웨어 설정
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));

app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// 라우트 설정
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/services', require('./routes/services'));

// 헬스 체크
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'DSPM Auth Service is running',
    timestamp: new Date().toISOString(),
    version: require('../package.json').version
  });
});

// 기본 라우트
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'DSPM Authentication Service',
    version: require('../package.json').version,
    endpoints: {
      auth: '/api/auth',
      user: '/api/user',
      services: '/api/services',
      health: '/health'
    }
  });
});

// 404 핸들러
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// 에러 핸들러
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 DSPM Auth Service running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📋 API Documentation: http://localhost:${PORT}/`);
});

module.exports = app;