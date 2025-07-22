FROM node:20-alpine

WORKDIR /app

# Tüm monorepo'yu kopyala
COPY . .

RUN npm install -g pnpm

# Kökte install (tüm workspace bağımlılıkları yüklenir)
RUN pnpm install --force --no-verify-store-integrity

WORKDIR /app/packages/web

CMD ["pnpm", "run", "dev"]
