import globals from "globals";
import js from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
import unusedImports from "eslint-plugin-unused-imports"; // <– Add this import

export default [
  js.configs.recommended,
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
];
