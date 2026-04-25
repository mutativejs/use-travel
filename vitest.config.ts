import { coverageConfigDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [...coverageConfigDefaults.exclude, 'test-d/**'],
    },
  },
  define: {
    __DEV__: false,
  },
});
