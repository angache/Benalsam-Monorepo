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

# Web klasörüne geç ve node_modules'ı kontrol et
WORKDIR /app/packages/web
RUN pnpm install --frozen-lockfile --no-verify-store-integrity --prefer-offline

# Vite'ın tüm interface'leri dinlemesi için
ENV HOST=0.0.0.0
# Rollup native binary'lerini devre dışı bırak
ENV ROLLUP_SKIP_NATIVE=true
ENV ROLLUP_SKIP_NATIVE_BINARY=true
ENV NODE_OPTIONS="--no-experimental-fetch"

# Environment değişkenlerini build time'da kopyala (eğer varsa)
COPY .env* ./

CMD ["pnpm", "run", "dev"]
