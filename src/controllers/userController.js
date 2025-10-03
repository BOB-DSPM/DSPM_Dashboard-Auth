const { admin } = require('../config/firebase');

class UserController {
  /**
   * 사용자 프로필 조회
   */
  async getProfile(req, res) {
    try {
      const { uid } = req.user;
      
      // Firebase에서 사용자 정보 조회
      const userRecord = await admin.auth().getUser(uid);
      
      const profile = {
        uid: userRecord.uid,
        email: userRecord.email,
        emailVerified: userRecord.emailVerified,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL,
        disabled: userRecord.disabled,
        metadata: {
          creationTime: userRecord.metadata.creationTime,
          lastSignInTime: userRecord.metadata.lastSignInTime,
          lastRefreshTime: userRecord.metadata.lastRefreshTime
        },
        customClaims: userRecord.customClaims || {},
        providerData: userRecord.providerData
      };

      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user profile'
      });
    }
  }

  /**
   * 사용자 프로필 업데이트
   */
  async updateProfile(req, res) {
    try {
      const { uid } = req.user;
      const { displayName, photoURL } = req.body;

      const updateData = {};
      if (displayName !== undefined) updateData.displayName = displayName;
      if (photoURL !== undefined) updateData.photoURL = photoURL;

      // Firebase에서 사용자 정보 업데이트
      const updatedUser = await admin.auth().updateUser(uid, updateData);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          uid: updatedUser.uid,
          displayName: updatedUser.displayName,
          photoURL: updatedUser.photoURL
        }
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update profile'
      });
    }
  }

  /**
   * 사용자 커스텀 클레임 설정 (관리자 전용)
   */
  async setCustomClaims(req, res) {
    try {
      const { uid, claims } = req.body;

      if (!uid) {
        return res.status(400).json({
          success: false,
          message: 'User UID is required'
        });
      }

      // 커스텀 클레임 설정
      await admin.auth().setCustomUserClaims(uid, claims);

      res.json({
        success: true,
        message: 'Custom claims updated successfully'
      });
    } catch (error) {
      console.error('Set custom claims error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to set custom claims'
      });
    }
  }

  /**
   * 사용자 목록 조회 (관리자 전용)
   */
  async listUsers(req, res) {
    try {
      const { maxResults = 1000, pageToken } = req.query;

      const listUsersResult = await admin.auth().listUsers(maxResults, pageToken);

      const users = listUsersResult.users.map(userRecord => ({
        uid: userRecord.uid,
        email: userRecord.email,
        emailVerified: userRecord.emailVerified,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL,
        disabled: userRecord.disabled,
        metadata: {
          creationTime: userRecord.metadata.creationTime,
          lastSignInTime: userRecord.metadata.lastSignInTime
        },
        customClaims: userRecord.customClaims || {}
      }));

      res.json({
        success: true,
        data: {
          users,
          pageToken: listUsersResult.pageToken
        }
      });
    } catch (error) {
      console.error('List users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to list users'
      });
    }
  }

  /**
   * 사용자 계정 비활성화/활성화 (관리자 전용)
   */
  async toggleUserStatus(req, res) {
    try {
      const { uid, disabled } = req.body;

      if (!uid) {
        return res.status(400).json({
          success: false,
          message: 'User UID is required'
        });
      }

      const updatedUser = await admin.auth().updateUser(uid, { disabled });

      res.json({
        success: true,
        message: `User ${disabled ? 'disabled' : 'enabled'} successfully`,
        data: {
          uid: updatedUser.uid,
          disabled: updatedUser.disabled
        }
      });
    } catch (error) {
      console.error('Toggle user status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user status'
      });
    }
  }

  /**
   * 사용자 계정 삭제 (관리자 전용)
   */
  async deleteUser(req, res) {
    try {
      const { uid } = req.params;

      if (!uid) {
        return res.status(400).json({
          success: false,
          message: 'User UID is required'
        });
      }

      await admin.auth().deleteUser(uid);

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete user'
      });
    }
  }
}

module.exports = new UserController();