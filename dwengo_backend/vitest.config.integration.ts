// vitest.config.integration.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['./tests/integratie/**/*.test.ts'],
    setupFiles: ['./tests/helpers/setup.ts'],
    poolOptions: {
      forks: {
        singleFork: true
      }
    },
    coverage: {
      provider: 'v8'
    }
  }
});
