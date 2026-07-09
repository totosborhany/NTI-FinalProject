import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended, // Only catches real errors (broken variables, syntax bugs)
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node, // Allows 'process', 'require', etc. without throwing errors
      },
    },
    rules: {
      // Turn off annoying stylistic rules completely
      "no-unused-vars": "warn",     // Only warn if you leave a variable unused
      "no-console": "off",          // Allow console.log completely
      "no-debugger": "warn",         
      "eqeqeq": "off",              // Don't force === over ==
      "curly": "off",               // Don't force brackets for one-line if statements
    },
  },
];
