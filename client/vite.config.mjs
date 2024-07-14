import dotenv from 'dotenv';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react';

dotenv.config();

const CLIENT_PORT = Number(process.env.CLIENT_PORT) || 5174;
const SERVER_PORT = Number(process.env.SERVER_PORT) || 8080;

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
        target: `http://localhost:${SERVER_PORT}`,
        changeOrigin: true,
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
