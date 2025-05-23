import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["./tests/unit/**/*.test.ts"],
    globals: true,
    coverage: {
      provider: "v8",
    },
  },
});
