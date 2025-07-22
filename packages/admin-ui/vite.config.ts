import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Environment detection
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/admin/', // Nginx reverse proxy için base path
  server: {
    port: 3003,
    host: '0.0.0.0', // Tüm network interface'lerini dinle
    strictPort: true, // Port kullanımdaysa hata ver
    cors: true, // CORS'u etkinleştir
    hmr: false, // VPS'de HMR sorunları yaşanıyor, devre dışı bırak
    allowedHosts: [
      'benalsam.com',
      'www.benalsam.com',
      'localhost',
      '127.0.0.1',
      '209.227.228.96'
    ], // Domain'leri kabul et
    watch: {
      usePolling: true, // VPS'de dosya değişikliklerini izlemek için polling kullan
      interval: 1000, // 1 saniye aralıklarla kontrol et
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  define: {
    'process.env': {},
  },
})
