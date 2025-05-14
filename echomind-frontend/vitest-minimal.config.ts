import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    include: ['simple.test.js', 'dom.test.js', 'src/test/config.test.js', 'src/__tests__/e2e/*.test.{js,ts,jsx,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
        maxWorkers: 1,
      },
    },
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  define: {
    'import.meta.env.VITE_SUPABASE_URL': JSON.stringify('https://test-supabase-url.com'),
    'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify('test-anon-key'),
    'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify('test-gemini-api-key'),
    'import.meta.env.VITE_APP_ENV': JSON.stringify('test'),
    'import.meta.env.MODE': JSON.stringify('test'),
    'process.env': JSON.stringify({
      NODE_ENV: 'test',
    }),
  },
});
