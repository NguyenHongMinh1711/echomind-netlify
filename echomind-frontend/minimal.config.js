// minimal.config.js
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['simple.test.js', 'dom.test.js'],
    setupFiles: ['./src/test/setup.js'],
  },
});
