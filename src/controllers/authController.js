const { admin } = require('../config/firebase');

class AuthController {
  /**
   * 토큰 검증 (다른 서비스에서 사용)
   */
  async verifyToken(req, res) {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(400).json({
          success: false,
          message: 'Authorization header with Bearer token required'
        });
      }

      const idToken = authHeader.split('Bearer ')[1];
      
      if (!idToken) {
        return res.status(400).json({
          success: false,
          message: 'ID token is required'
        });
      }

      // Firebase ID 토큰 검증
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      
      // 사용자 정보 조회
      const userRecord = await admin.auth().getUser(decodedToken.uid);

      const userData = {
        uid: userRecord.uid,
        email: userRecord.email,
        emailVerified: userRecord.emailVerified,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL,
        disabled: userRecord.disabled,
        customClaims: userRecord.customClaims || {},
        lastSignInTime: userRecord.metadata.lastSignInTime,
        creationTime: userRecord.metadata.creationTime
      };

      res.json({
        success: true,
        message: 'Token is valid',
        data: userData
      });
    } catch (error) {
      console.error('Token verification error:', error);
      
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
        message: 'Invalid token',
        code: 'INVALID_TOKEN'
      });
    }
  }

  /**
   * 사용자 토큰 취소 (로그아웃)
   */
  async revokeToken(req, res) {
    try {
      const { uid } = req.user;

      // 사용자의 모든 refresh token 취소
      await admin.auth().revokeRefreshTokens(uid);

      res.json({
        success: true,
        message: 'All tokens revoked successfully'
      });
    } catch (error) {
      console.error('Token revocation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to revoke tokens'
      });
    }
  }

  /**
   * 커스텀 토큰 생성 (서버 간 통신용)
   */
  async createCustomToken(req, res) {
    try {
      const { uid, additionalClaims } = req.body;

      if (!uid) {
        return res.status(400).json({
          success: false,
          message: 'User UID is required'
        });
      }

      // 커스텀 토큰 생성
      const customToken = await admin.auth().createCustomToken(uid, additionalClaims);

      res.json({
        success: true,
        data: {
          customToken
        }
      });
    } catch (error) {
      console.error('Custom token creation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create custom token'
      });
    }
  }

  /**
   * 사용자 세션 쿠키 생성
   */
  async createSessionCookie(req, res) {
    try {
      const { idToken, expiresIn = 60 * 60 * 24 * 5 * 1000 } = req.body; // 5일

      if (!idToken) {
        return res.status(400).json({
          success: false,
          message: 'ID token is required'
        });
      }

      // 세션 쿠키 생성
      const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });

      res.json({
        success: true,
        data: {
          sessionCookie
        }
      });
    } catch (error) {
      console.error('Session cookie creation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create session cookie'
      });
    }
  }

  /**
   * 세션 쿠키 검증
   */
  async verifySessionCookie(req, res) {
    try {
      const { sessionCookie } = req.body;

      if (!sessionCookie) {
        return res.status(400).json({
          success: false,
          message: 'Session cookie is required'
        });
      }

      // 세션 쿠키 검증
      const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true);
      
      // 사용자 정보 조회
      const userRecord = await admin.auth().getUser(decodedClaims.uid);

      const userData = {
        uid: userRecord.uid,
        email: userRecord.email,
        emailVerified: userRecord.emailVerified,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL,
        disabled: userRecord.disabled,
        customClaims: userRecord.customClaims || {}
      };

      res.json({
        success: true,
        message: 'Session cookie is valid',
        data: userData
      });
    } catch (error) {
      console.error('Session cookie verification error:', error);
      res.status(401).json({
        success: false,
        message: 'Invalid session cookie'
      });
    }
  }

  /**
   * 서비스용 사용자 정보 조회 (다른 DSPM 서비스에서 사용)
   */
  async getUserForService(req, res) {
    try {
      const { uid } = req.params;

      if (!uid) {
        return res.status(400).json({
          success: false,
          message: 'User UID is required'
        });
      }

      // Firebase에서 사용자 정보 조회
      const userRecord = await admin.auth().getUser(uid);

      // 서비스에서 필요한 최소한의 정보만 제공
      const userData = {
        uid: userRecord.uid,
        email: userRecord.email,
        emailVerified: userRecord.emailVerified,
        displayName: userRecord.displayName,
        disabled: userRecord.disabled,
        customClaims: userRecord.customClaims || {},
        metadata: {
          creationTime: userRecord.metadata.creationTime,
          lastSignInTime: userRecord.metadata.lastSignInTime
        }
      };

      res.json({
        success: true,
        data: userData
      });
    } catch (error) {
      console.error('Get user for service error:', error);
      
      if (error.code === 'auth/user-not-found') {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to get user information'
      });
    }
  }

  /**
   * 관리자가 직접 사용자 생성 (회원가입 대체)
   */
  async createUser(req, res) {
    try {
      const { email, displayName, password, customClaims = {}, emailVerified = true } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }

      // 사용자 생성 데이터 준비
      const userData = {
        email,
        emailVerified,
        disabled: false
      };

      if (displayName) userData.displayName = displayName;
      if (password) userData.password = password;

      // Firebase에서 사용자 생성
      const userRecord = await admin.auth().createUser(userData);

      // 커스텀 클레임 설정 (있는 경우)
      if (Object.keys(customClaims).length > 0) {
        await admin.auth().setCustomUserClaims(userRecord.uid, customClaims);
      }

      console.log(`New user created by admin: ${email} (UID: ${userRecord.uid})`);

      res.json({
        success: true,
        message: 'User created successfully',
        data: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
          emailVerified: userRecord.emailVerified,
          customClaims
        }
      });
    } catch (error) {
      console.error('Create user error:', error);
      
      if (error.code === 'auth/email-already-exists') {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }

      if (error.code === 'auth/invalid-email') {
        return res.status(400).json({
          success: false,
          message: 'Invalid email format'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to create user'
      });
    }
  }
}

module.exports = new AuthController();