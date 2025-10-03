# DSPM Authentication Service - 완전 가이드

## 📋 구성 요소 (Architecture Overview)

### 1. 프로젝트 구조
```
DSPM_Dashboard-Auth/
├── src/
│   ├── app.js                    # 메인 애플리케이션 (Express 서버)
│   ├── config/
│   │   ├── firebase.js           # Firebase Admin SDK 초기화
│   │   └── firebase-service-account.json  # Firebase 서비스 계정 키
│   ├── controllers/
│   │   ├── authController.js     # 인증 관련 비즈니스 로직
│   │   └── userController.js     # 사용자 관리 비즈니스 로직
│   ├── middleware/
│   │   └── auth.js              # Firebase 토큰 검증 미들웨어
│   └── routes/
│       ├── auth.js              # 인증 라우트
│       ├── user.js              # 사용자 관리 라우트
│       └── services.js          # 백엔드 연동 라우트
├── package.json                 # 의존성 및 스크립트
├── .env                        # 환경 변수
└── README.md                   # 문서
```

### 2. 핵심 의존성
- **firebase-admin**: Firebase Admin SDK (사용자 관리, 토큰 검증)
- **express**: Node.js 웹 프레임워크
- **cors**: Cross-Origin Resource Sharing 설정
- **helmet**: 보안 헤더 설정
- **express-rate-limit**: API 요청 제한
- **dotenv**: 환경 변수 관리

## 🔧 동작 원리

### 1. Firebase Authentication 플로우

#### **클라이언트 → Firebase → Auth Service → Backend**
```
1. 클라이언트에서 Firebase Auth로 로그인
2. Firebase에서 ID Token 발급
3. 클라이언트가 백엔드 요청 시 Authorization 헤더에 토큰 포함
4. 백엔드가 Auth Service에 토큰 검증 요청
5. Auth Service가 Firebase에서 토큰 검증
6. 사용자 정보 반환
```

### 2. 토큰 검증 과정
```javascript
// 1. 클라이언트 요청 헤더
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...

// 2. Auth Service에서 검증
admin.auth().verifyIdToken(idToken)

// 3. 검증 성공 시 사용자 정보 반환
{
  uid: "firebase-user-id",
  email: "user@example.com",
  emailVerified: true,
  customClaims: { admin: true }
}
```

### 3. 서비스 간 통신 아키텍처
```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│   Frontend  │    │ Auth Service │    │   Backend   │
│ (React/Vue) │◄──►│ (Port 3001)  │◄──►│ (Port 3000) │
└─────────────┘    └──────────────┘    └─────────────┘
       │                    │                    │
       │                    ▼                    │
       │            ┌──────────────┐             │
       └───────────►│   Firebase   │◄────────────┘
                    │ Authentication│
                    └──────────────┘
```

## 🚀 API 엔드포인트 상세

### 1. 백엔드 연동 API (`/api/services`)

#### **토큰 검증** - `POST /api/services/validate-token`
```bash
curl -X POST http://localhost:3001/api/services/validate-token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FIREBASE_ID_TOKEN"

# 응답 예시
{
  "success": true,
  "message": "Token is valid",
  "data": {
    "uid": "firebase-user-id",
    "email": "user@example.com",
    "emailVerified": true,
    "displayName": "John Doe",
    "customClaims": { "admin": true },
    "lastSignInTime": "2025-10-03T10:30:00Z"
  }
}
```

#### **사용자 정보 조회** - `GET /api/services/user/:uid`
```bash
curl http://localhost:3001/api/services/user/firebase-user-id

# 응답 예시
{
  "success": true,
  "data": {
    "uid": "firebase-user-id",
    "email": "user@example.com",
    "displayName": "John Doe",
    "disabled": false,
    "customClaims": { "admin": true }
  }
}
```

#### **사용자 생성** - `POST /api/services/create-user` (관리자 전용)
```bash
curl -X POST http://localhost:3001/api/services/create-user \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "email": "newuser@example.com",
    "displayName": "New User",
    "password": "securePassword123",
    "customClaims": { "role": "analyst" }
  }'

# 응답 예시
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "uid": "new-firebase-user-id",
    "email": "newuser@example.com",
    "displayName": "New User",
    "emailVerified": true
  }
}
```

### 2. 사용자 관리 API (`/api/user`)

#### **프로필 조회** - `GET /api/user/profile`
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/user/profile
```

#### **사용자 목록** - `GET /api/user/list` (관리자 전용)
```bash
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  "http://localhost:3001/api/user/list?maxResults=50"
```

#### **커스텀 클레임 설정** - `POST /api/user/custom-claims` (관리자 전용)
```bash
curl -X POST http://localhost:3001/api/user/custom-claims \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "uid": "target-user-id",
    "claims": { "admin": true, "role": "super-admin" }
  }'
```

### 3. 인증 API (`/api/auth`)

#### **로그아웃** - `POST /api/auth/logout`
```bash
curl -X POST http://localhost:3001/api/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### **세션 쿠키 생성** - `POST /api/auth/session-cookie`
```bash
curl -X POST http://localhost:3001/api/auth/session-cookie \
  -H "Content-Type: application/json" \
  -d '{
    "idToken": "YOUR_FIREBASE_ID_TOKEN",
    "expiresIn": 432000000
  }'
```

## ⚙️ 설정 및 환경 변수

### `.env` 파일
```bash
# 서버 설정
PORT=3001
NODE_ENV=development

# Firebase 설정
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_SERVICE_ACCOUNT_PATH=./src/config/firebase-service-account.json

# CORS 설정 (백엔드 및 프론트엔드 URL)
CORS_ORIGIN=http://localhost:3000,http://localhost:3002,http://localhost:8080

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15분
RATE_LIMIT_MAX_REQUESTS=100  # 15분당 100회 요청

# 로그 설정
LOG_LEVEL=info
```

### Firebase 서비스 계정 키 구조
```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "key-id",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token"
}
```

## 🔧 설치 및 실행

### 1. 의존성 설치
```bash
cd /home/won/workspace/bob/dspm-project/DSPM_Dashboard-Auth
npm install
```

### 2. Firebase 설정
1. Firebase 콘솔에서 프로젝트 생성
2. Authentication 활성화
3. 서비스 계정 키 다운로드
4. `src/config/firebase-service-account.json`에 배치

### 3. 환경변수 설정
```bash
cp .env.example .env
# .env 파일 수정 (프로젝트 ID 등)
```

### 4. 서버 시작
```bash
# 개발 모드
npm run dev

# 프로덕션 모드
npm start
```

## 🧪 테스트

### 1. 헬스 체크
```bash
curl http://localhost:3001/health

# 응답
{
  "success": true,
  "message": "DSPM Auth Service is running",
  "timestamp": "2025-10-03T10:30:00.000Z",
  "version": "1.0.0"
}
```

### 2. API 정보 확인
```bash
curl http://localhost:3001/

# 응답
{
  "success": true,
  "message": "DSPM Authentication Service",
  "version": "1.0.0",
  "endpoints": {
    "auth": "/api/auth",
    "user": "/api/user",
    "services": "/api/services",
    "health": "/health"
  }
}
```

## 🔐 보안 기능

### 1. Rate Limiting
- 15분당 100회 요청 제한
- IP 기반 제한

### 2. CORS 설정
- 허용된 도메인만 접근 가능
- Credentials 포함 요청 지원

### 3. Helmet 보안 헤더
- Content Security Policy
- X-Frame-Options
- X-Content-Type-Options

### 4. Firebase 토큰 검증
- 만료 시간 확인
- 토큰 무효화 확인
- 사용자 비활성화 상태 확인

## 🔗 백엔드 연동 예시

### Express.js 백엔드에서 사용
```javascript
// 미들웨어 함수
const verifyAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split('Bearer ')[1];
    
    const response = await fetch('http://localhost:3001/api/services/validate-token', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      const { data } = await response.json();
      req.user = data;
      next();
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Auth service error' });
  }
};

// 보호된 라우트에서 사용
app.get('/api/protected', verifyAuth, (req, res) => {
  res.json({ message: `Hello ${req.user.displayName}!` });
});
```

## ❗ 주의사항

1. **Firebase 서비스 계정 키 보안**
   - 절대 Git에 커밋하지 말 것
   - 환경변수나 보안 볼트 사용 권장

2. **CORS 설정**
   - 프로덕션에서는 필요한 도메인만 허용

3. **Rate Limiting**
   - 프로덕션 환경에 맞게 조정 필요

4. **로그 관리**
   - 프로덕션에서는 민감한 정보 로깅 금지

이제 `npm run dev`로 서버를 시작하고 curl 명령어로 테스트해보세요!