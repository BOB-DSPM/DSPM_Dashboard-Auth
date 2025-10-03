const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyFirebaseToken } = require('../middleware/auth');

// 토큰 검증 (다른 서비스에서 사용)
router.post('/verify-token', authController.verifyToken);

// 로그아웃 (토큰 취소)
router.post('/logout', verifyFirebaseToken, authController.revokeToken);

// 커스텀 토큰 생성 (서버 간 통신용)
router.post('/custom-token', authController.createCustomToken);

// 세션 쿠키 관련
router.post('/session-cookie', authController.createSessionCookie);
router.post('/verify-session', authController.verifySessionCookie);

module.exports = router;