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
    port: 3003,
    host: '0.0.0.0',
    strictPort: true,
    cors: true,
    hmr: {
      host: 'localhost',
      port: 3003,
      protocol: 'ws',
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