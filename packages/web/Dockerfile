FROM node:20-alpine

WORKDIR /app

# Tüm monorepo'yu kopyala
COPY . .

RUN npm install -g pnpm

# Kökte install (tüm workspace bağımlılıkları yüklenir)
RUN pnpm install --force --no-verify-store-integrity

WORKDIR /app/packages/web

# Vite'ın tüm interface'leri dinlemesi için
ENV HOST=0.0.0.0

# Environment değişkenlerini build time'da kopyala (eğer varsa)
COPY .env* ./

CMD ["pnpm", "run", "dev"]
