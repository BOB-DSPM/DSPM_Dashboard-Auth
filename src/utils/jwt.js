const jwt = require('jsonwebtoken');

const generateTokens = (payload) => {
  const accessToken = jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { 
      expiresIn: process.env.JWT_EXPIRES_IN || '1h',
      issuer: 'dspm-auth-service'
    }
  );

  const refreshToken = jwt.sign(
    { userId: payload.userId },
    process.env.JWT_REFRESH_SECRET,
    { 
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      issuer: 'dspm-auth-service'
    }
  );

  return { accessToken, refreshToken };
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

const getTokenFromHeader = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
};

module.exports = {
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  getTokenFromHeader
};