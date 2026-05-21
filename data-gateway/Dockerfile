# msaez-data-gateway 컨테이너 이미지 (v1.0.30)
# 자체 Node 20 런타임을 번들한다 — 호스트 Node 버전과 무관.
FROM node:20-slim

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --omit=dev

COPY src ./src
COPY migrations ./migrations

# 기존 AceBase 자리(5757)를 그대로 차지
EXPOSE 5757

CMD ["node", "src/server.js"]
