/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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