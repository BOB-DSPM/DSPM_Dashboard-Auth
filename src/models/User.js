const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, '사용자명은 필수입니다.'],
    unique: true,
    trim: true,
    minlength: [3, '사용자명은 최소 3자 이상이어야 합니다.'],
    maxlength: [20, '사용자명은 최대 20자까지 가능합니다.']
  },
  email: {
    type: String,
    required: [true, '이메일은 필수입니다.'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, '유효한 이메일 주소를 입력해주세요.']
  },
  password: {
    type: String,
    required: [true, '비밀번호는 필수입니다.'],
    minlength: [6, '비밀번호는 최소 6자 이상이어야 합니다.']
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'analyst'],
    default: 'user'
  },
  profile: {
    firstName: {
      type: String,
      trim: true
    },
    lastName: {
      type: String,
      trim: true
    },
    department: {
      type: String,
      trim: true
    },
    position: {
      type: String,
      trim: true
    }
  },
  permissions: {
    lineage: {
      read: { type: Boolean, default: true },
      write: { type: Boolean, default: false }
    },
    analyzer: {
      read: { type: Boolean, default: true },
      write: { type: Boolean, default: false }
    },
    collector: {
      read: { type: Boolean, default: true },
      write: { type: Boolean, default: false }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  refreshTokens: [{
    token: String,
    createdAt: { type: Date, default: Date.now },
    expiresAt: Date
  }]
}, {
  timestamps: true
});

// 비밀번호 해싱 미들웨어
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 비밀번호 검증 메서드
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// 사용자 정보 반환 (비밀번호 제외)
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.refreshTokens;
  return userObject;
};

// 만료된 refresh token 정리
userSchema.methods.cleanExpiredTokens = function() {
  this.refreshTokens = this.refreshTokens.filter(
    tokenObj => tokenObj.expiresAt > new Date()
  );
};

// 인덱스 설정
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ 'refreshTokens.token': 1 });

module.exports = mongoose.model('User', userSchema);