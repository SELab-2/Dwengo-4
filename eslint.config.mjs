import globals from "globals";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";
import unusedImports from "eslint-plugin-unused-imports"; // <– Add this import
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  globalIgnores(["frontend/dist/"]),
  {
    files: ["**/*.{js,ts}"],
    // Add plugin to the configuration object
    plugins: {
      "unused-imports": unusedImports, // <– Register the plugin
    },
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off", // Allow 'any' type
      "no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      // Reference the rule correctly using the registered plugin name
      "unused-imports/no-unused-imports": "error", // <– Fixed reference
    },
  },
  prettierConfig,
]);
