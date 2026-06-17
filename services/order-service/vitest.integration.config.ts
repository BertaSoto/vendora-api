import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./tests/integration/setup.ts'],
    include: ['tests/integration/**/*.test.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage/integration',
      include: ['src/**/*.ts'],
      exclude: ['src/index.ts', 'src/lib/**'],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 50,
        statements: 70,
      },
    },
  },
})
