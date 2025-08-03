FROM node:20-alpine

WORKDIR /app

# Sadece package.json dosyalarını kopyala
COPY package.json pnpm-lock.yaml ./
COPY packages/web/package.json ./packages/web/
COPY packages/shared-types/package.json ./packages/shared-types/

# pnpm install - minimal approach
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile --no-verify-store-integrity --prefer-offline

# Şimdi tüm kodu kopyala
COPY . .

WORKDIR /app/packages/web

# Vite'ın tüm interface'leri dinlemesi için
ENV HOST=0.0.0.0

# Environment değişkenlerini build time'da kopyala (eğer varsa)
COPY .env* ./

CMD ["pnpm", "run", "dev"]
