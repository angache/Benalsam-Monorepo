import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Environment detection
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';
const VPS_IP = '209.227.228.96';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3003,
    host: '0.0.0.0', // Tüm network interface'lerini dinle
    strictPort: true, // Port kullanımdaysa hata ver
    cors: true, // CORS'u etkinleştir
    hmr: {
      host: VPS_IP, // Always use VPS IP for HMR
      port: 3003,
      protocol: 'ws',
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  define: {
    'process.env': {},
    'import.meta.env.VITE_API_URL': JSON.stringify(`http://${VPS_IP}:3002/api/v1`),
    'import.meta.env.VITE_WS_URL': JSON.stringify(`ws://${VPS_IP}:3003`),
  },
})
