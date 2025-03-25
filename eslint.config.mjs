// eslint.config.js
import globals from "globals";
import js from "@eslint/js";
import prettierConfig from "eslint-config-prettier";

export default [
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
      "no-unused-vars": "error",
    },
  },
  js.configs.recommended,
  prettierConfig,
];
