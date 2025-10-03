const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyFirebaseToken, requireAdmin } = require('../middleware/auth');

// 사용자 프로필 관련
router.get('/profile', verifyFirebaseToken, userController.getProfile);
router.put('/profile', verifyFirebaseToken, userController.updateProfile);

// 관리자 전용 - 사용자 관리
router.get('/list', verifyFirebaseToken, requireAdmin, userController.listUsers);
router.post('/custom-claims', verifyFirebaseToken, requireAdmin, userController.setCustomClaims);
router.post('/toggle-status', verifyFirebaseToken, requireAdmin, userController.toggleUserStatus);
router.delete('/:uid', verifyFirebaseToken, requireAdmin, userController.deleteUser);

module.exports = router;