import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    setupFiles: ['tests/setup.ts'],
    testTimeout: 30000, // 30s per test (auth operations can be slow)
    hookTimeout: 30000,
    // Run test files sequentially to avoid DB conflicts
    sequence: {
      concurrent: false,
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.ts',
        'src/workers/', // Workers tested separately
        'src/utils/cloudinary.ts', // External service
      ],
    },
  },
});
