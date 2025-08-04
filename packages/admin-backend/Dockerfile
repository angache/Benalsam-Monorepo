FROM node:20-alpine

WORKDIR /app

# Sadece package.json dosyalarını kopyala
COPY package.json pnpm-lock.yaml ./
COPY packages/admin-backend/package.json ./packages/admin-backend/
COPY packages/shared-types/package.json ./packages/shared-types/

# pnpm install - minimal approach
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile --no-verify-store-integrity --prefer-offline

# Şimdi tüm kodu kopyala
COPY . .

WORKDIR /app/packages/admin-backend

CMD ["pnpm", "run", "dev"]
