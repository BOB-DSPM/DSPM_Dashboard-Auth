# Node.js 공식 이미지 사용
FROM node:20-alpine

# 작업 디렉토리 생성 및 이동
WORKDIR /app

# package.json, package-lock.json 복사
COPY package*.json ./

# 운영 환경용: devDependencies는 제외
RUN npm ci --omit=dev

# 소스 코드 복사
COPY . .

# build-arg 환경 변수 -> .env 파일에 저장
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

# 포트
EXPOSE 3005

# 운영 환경은 nodemon X → node 실행
CMD ["npm", "run", "start"]
