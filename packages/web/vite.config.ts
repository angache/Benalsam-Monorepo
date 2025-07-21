import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  base: '/admin/',
  server: {
    port: 5173, // Web için doğru port
    host: '0.0.0.0',
    strictPort: true,
    cors: true,
    hmr: false, // VPS'de HMR sorunları yaşanıyor, devre dışı bırak
    watch: {
      usePolling: true, // VPS'de dosya değişikliklerini izlemek için polling kullan
      interval: 1000, // 1 saniye aralıklarla kontrol et
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Production optimizations
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          admin: ['@/services/adminAuthService', '@/services/adminManagementService'],
          charts: ['recharts', 'chart.js'],
        },
      },
    },
    // Bundle analysis
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000,
  },
  define: {
    'process.env': {},
  },
  // Performance optimizations
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
}); 