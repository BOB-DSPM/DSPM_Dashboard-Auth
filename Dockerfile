# Node.js 공식 이미지 사용
FROM node:20-alpine

# 작업 디렉토리 생성 및 이동
WORKDIR /app

# package.json, package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm ci --omit=dev

# 소스 코드 복사
COPY . .

# 환경 변수 예시 파일 복사 (실제 배포시 .env는 별도 관리)

# build-arg로 전달된 환경 변수들을 .env 파일로 저장
RUN echo "FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID}" >> .env && \
	echo "FIREBASE_PRIVATE_KEY_ID=${FIREBASE_PRIVATE_KEY_ID}" >> .env && \
	echo "FIREBASE_PRIVATE_KEY='${FIREBASE_PRIVATE_KEY}'" >> .env && \
	echo "FIREBASE_CLIENT_EMAIL=${FIREBASE_CLIENT_EMAIL}" >> .env && \
	echo "FIREBASE_CLIENT_ID=${FIREBASE_CLIENT_ID}" >> .env && \
	echo "FIREBASE_AUTH_URI=${FIREBASE_AUTH_URI}" >> .env && \
	echo "FIREBASE_TOKEN_URI=${FIREBASE_TOKEN_URI}" >> .env && \
	echo "FIREBASE_AUTH_PROVIDER_X509_CERT_URL=${FIREBASE_AUTH_PROVIDER_X509_CERT_URL}" >> .env && \
	echo "FIREBASE_CLIENT_X509_CERT_URL=${FIREBASE_CLIENT_X509_CERT_URL}" >> .env && \
	echo "FIREBASE_UNIVERSE_DOMAIN=${FIREBASE_UNIVERSE_DOMAIN}" >> .env && \
	echo "JWT_SECRET=${JWT_SECRET}" >> .env && \
	echo "JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}" >> .env && \
	echo "JWT_EXPIRES_IN=${JWT_EXPIRES_IN}" >> .env && \
	echo "JWT_REFRESH_EXPIRES_IN=${JWT_REFRESH_EXPIRES_IN}" >> .env

# 3005 포트 오픈
EXPOSE 3005

# 앱 실행
CMD ["npm", "run", "dev"]
