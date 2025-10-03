# DSPM Authentication Service

DSPM 시스템의 Firebase 기반 인증 서비스입니다. 기존 백엔드와 연동하여 사용자 인증 및 권한 관리를 담당합니다.

## 주요 기능

- Firebase Authentication 기반 사용자 인증
- JWT 토큰 검증 및 관리
- 백엔드 서비스와의 사용자 정보 공유
- 관리자에 의한 직접 사용자 등록 (회원가입 없음)
- Rate limiting 및 보안 강화

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env

# Firebase 서비스 계정 키 설정
# src/config/firebase-service-account.json 파일에 Firebase 키 배치

# 개발 모드 실행
npm run dev

# 프로덕션 모드 실행
npm start
```

## API 엔드포인트

### 인증 서비스 (백엔드 연동용)
- `POST /api/services/validate-token` - 토큰 검증
- `GET /api/services/user/:uid` - 사용자 정보 조회
- `POST /api/services/create-user` - 사용자 생성 (관리자 전용)

### 사용자 관리
- `GET /api/user/profile` - 사용자 프로필 조회
- `PUT /api/user/profile` - 사용자 프로필 수정
- `GET /api/user/list` - 사용자 목록 조회 (관리자 전용)

### 인증
- `POST /api/auth/verify-token` - 토큰 검증
- `POST /api/auth/logout` - 로그아웃 (토큰 취소)
- `POST /api/auth/session-cookie` - 세션 쿠키 생성

### 시스템
- `GET /health` - 헬스 체크
- `GET /` - API 정보

## 백엔드 연동 예시

### 토큰 검증
```javascript
const response = await fetch('http://localhost:3001/api/services/validate-token', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${idToken}`
  }
});

if (response.ok) {
  const { data } = await response.json();
  console.log('사용자 정보:', data);
}
```

### 사용자 정보 조회
```javascript
const response = await fetch(`http://localhost:3001/api/services/user/${uid}`);
const { data } = await response.json();
```

## Firebase 설정

1. Firebase 프로젝트 생성
2. Authentication 활성화
3. 서비스 계정 키 다운로드
4. `src/config/firebase-service-account.json`에 키 파일 배치
5. `.env` 파일에 프로젝트 ID 설정

## 환경 변수

```
PORT=3001
NODE_ENV=development
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT_PATH=./src/config/firebase-service-account.json
CORS_ORIGIN=http://localhost:3000,http://localhost:3002
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 보안 사항

- Firebase 서비스 계정 키는 반드시 안전하게 보관
- 프로덕션 환경에서는 적절한 CORS 설정
- Rate limiting으로 API 남용 방지
- Helmet을 통한 보안 헤더 설정