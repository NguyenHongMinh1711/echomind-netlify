import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'vitest.setup.ts',
        'vitest.config.ts',
        'src/vite-env.d.ts',
        'src/main.tsx',
        'public/',
        'src/test/'
      ]
    },
    include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}']
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
