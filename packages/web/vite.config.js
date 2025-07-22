import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [react()],
	server: {
		host: '0.0.0.0',
		port: 5173,
		cors: true,
		strictPort: true,
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
	resolve: {
		extensions: ['.jsx', '.js', '.tsx', '.ts', '.json'],
		alias: {
			'@': path.resolve(__dirname, './src'),
			'@benalsam/shared-types': path.resolve(__dirname, '../shared-types/dist-esm'),
		},
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					vendor: ['react', 'react-dom'],
					router: ['react-router-dom'],
					ui: ['framer-motion', 'lucide-react'],
					query: ['@tanstack/react-query'],
					supabase: ['@supabase/supabase-js'],
				},
			}
		},
		chunkSizeWarningLimit: 1000,
		sourcemap: false,
	}
});
