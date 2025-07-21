import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Environment detection
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';
const VPS_IP = '209.227.228.96';

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
    'process.env': {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
      VITE_API_URL: JSON.stringify(`http://${VPS_IP}:3002`),
      VITE_ELASTICSEARCH_URL: JSON.stringify(`http://${VPS_IP}:3002/api/v1/elasticsearch`),
    },
  },
})
