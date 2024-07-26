import dotenv from 'dotenv';
import path from 'path';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react';

dotenv.config({ path: process.env.NODE_ENV === 'development' ? path.resolve("../", '.env') : path.resolve(".", '.env') });

const CLIENT_PORT = Number(process.env.CLIENT_PORT) || 5173;
const SERVER_PORT = Number(process.env.SERVER_PORT) || 8080;
const proxyTarget = process.env.MONGO_HOST !== 'localhost' ? `http://backend:${SERVER_PORT}` : `http://localhost:${SERVER_PORT}`;

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    process.env.NODE_ENV === 'development'
      ? (() => {
          // Dynamically import the ESLint plugin only in development mode
          return import("vite-plugin-eslint").then(({ default: eslintPlugin }) => eslintPlugin());
        })()
      : null,
  ],
  server: {
    port: CLIENT_PORT,
    hmr: {
      overlay: false
    },
    watch: {
      usePolling: true
    },
    proxy: {
      '/api': {
        target: proxyTarget,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  cacheDir: process.env.VITE_CACHE_DIR ? process.env.VITE_CACHE_DIR : undefined,
  build: {
    outDir: '../dist/',
  },
  test: {
    globals: true,
    environment: 'jsdom'
  }
})
