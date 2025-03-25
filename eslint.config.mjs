// eslint.config.js
import globals from "globals";
import js from "@eslint/js";
import prettierConfig from "eslint-config-prettier";

export default [
  // 1. First apply recommended config
  js.configs.recommended,

  // 2. Then apply your customizations (overrides recommended rules)
  {
    files: ["**/*.{js,ts}"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },

  // 3. Finally apply Prettier compatibility (should come last)
  prettierConfig,
];
