const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAdmin } = require('../middleware/auth');

// 다른 DSPM 서비스들이 사용할 토큰 검증 API
router.post('/validate-token', authController.verifyToken);

// 서비스 간 통신용 사용자 정보 조회
router.get('/user/:uid', authController.getUserForService);

// 커스텀 토큰 생성 (서버 간 통신용)
router.post('/custom-token', requireAdmin, authController.createCustomToken);

// 관리자용 사용자 생성 (직접 등록)
router.post('/create-user', requireAdmin, authController.createUser);

module.exports = router;