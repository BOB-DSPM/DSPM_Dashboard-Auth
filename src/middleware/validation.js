const { body, validationResult } = require('express-validator');

// 입력 검증 규칙
const validationRules = {
  register: [
    body('username')
      .isLength({ min: 3, max: 20 })
      .withMessage('사용자명은 3-20자 사이여야 합니다.')
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('사용자명은 영문, 숫자, 언더스코어만 사용 가능합니다.'),
    
    body('email')
      .isEmail()
      .withMessage('유효한 이메일 주소를 입력해주세요.')
      .normalizeEmail(),
    
    body('password')
      .isLength({ min: 6 })
      .withMessage('비밀번호는 최소 6자 이상이어야 합니다.')
      .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
      .withMessage('비밀번호는 영문과 숫자를 포함해야 합니다.'),
    
    body('profile.firstName')
      .optional()
      .isLength({ max: 50 })
      .withMessage('이름은 최대 50자까지 가능합니다.'),
    
    body('profile.lastName')
      .optional()
      .isLength({ max: 50 })
      .withMessage('성은 최대 50자까지 가능합니다.')
  ],

  login: [
    body('email')
      .isEmail()
      .withMessage('유효한 이메일 주소를 입력해주세요.')
      .normalizeEmail(),
    
    body('password')
      .notEmpty()
      .withMessage('비밀번호를 입력해주세요.')
  ],

  updateProfile: [
    body('profile.firstName')
      .optional()
      .isLength({ max: 50 })
      .withMessage('이름은 최대 50자까지 가능합니다.'),
    
    body('profile.lastName')
      .optional()
      .isLength({ max: 50 })
      .withMessage('성은 최대 50자까지 가능합니다.'),
    
    body('profile.department')
      .optional()
      .isLength({ max: 100 })
      .withMessage('부서명은 최대 100자까지 가능합니다.'),
    
    body('profile.position')
      .optional()
      .isLength({ max: 100 })
      .withMessage('직책은 최대 100자까지 가능합니다.')
  ]
};

// 검증 결과 확인 미들웨어
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: '입력 데이터 검증 실패',
      details: errors.array()
    });
  }
  
  next();
};

module.exports = {
  validationRules,
  validate
};