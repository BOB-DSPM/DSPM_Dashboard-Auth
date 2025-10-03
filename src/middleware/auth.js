const { admin } = require('../config/firebase');

/**
 * Firebase ID 토큰 검증 미들웨어
 */
const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization header with Bearer token required'
      });
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    if (!idToken) {
      return res.status(401).json({
        success: false,
        message: 'ID token is required'
      });
    }

    // Firebase ID 토큰 검증
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // 사용자 정보를 req 객체에 추가
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      name: decodedToken.name,
      picture: decodedToken.picture,
      firebaseToken: decodedToken
    };

    next();
  } catch (error) {
    console.error('Firebase token verification error:', error);
    
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    if (error.code === 'auth/id-token-revoked') {
      return res.status(401).json({
        success: false,
        message: 'Token has been revoked',
        code: 'TOKEN_REVOKED'
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      code: 'INVALID_TOKEN'
    });
  }
};

/**
 * 선택적 Firebase 토큰 검증 (토큰이 있으면 검증, 없으면 무시)
 */
const optionalFirebaseAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    if (!idToken) {
      return next();
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      name: decodedToken.name,
      picture: decodedToken.picture,
      firebaseToken: decodedToken
    };

    next();
  } catch (error) {
    // 토큰 검증 실패 시에도 계속 진행 (선택적이므로)
    console.warn('Optional Firebase auth failed:', error.message);
    next();
  }
};

/**
 * 관리자 권한 확인 미들웨어
 */
const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Firebase Custom Claims에서 admin 권한 확인
    const userRecord = await admin.auth().getUser(req.user.uid);
    const customClaims = userRecord.customClaims || {};
    
    if (!customClaims.admin) {
      return res.status(403).json({
        success: false,
        message: 'Admin privileges required'
      });
    }

    next();
  } catch (error) {
    console.error('Admin check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking admin privileges'
    });
  }
};

module.exports = {
  verifyFirebaseToken,
  optionalFirebaseAuth,
  requireAdmin
};