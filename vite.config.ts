/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // This matches your rule: source: /api/*
      '/api': {
        target: 'https://api.wolexchange.com', // Your destination
        changeOrigin: true, // Recommended for cross-domain proxies
        secure: false,      // Can be useful if your API has a self-signed cert
        ws: true            // <-- HERE IS THE WEBSOCKET SETTING
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setupTests.ts',
    //include: ['src/test/**/*.{test,spec}.{ts,tsx}'],
    // You can also specify coverage options here
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
  },
});