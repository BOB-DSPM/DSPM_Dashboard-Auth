const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(err.stack);

  // JWT 에러 처리
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: '토큰이 만료되었습니다.' });
  }

  // Mongoose 검증 에러
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ error: '검증 실패', details: errors });
  }

  // MongoDB 중복 키 에러
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ error: `${field}이(가) 이미 존재합니다.` });
  }

  // 기본 에러 응답
  const statusCode = err.statusCode || 500;
  const message = err.message || '서버 내부 오류가 발생했습니다.';

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;