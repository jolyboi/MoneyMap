import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { 
    files: ["**/*.{js,mjs,cjs}"], 
    plugins: { js }, 
    // This part stays the same
    languageOptions: { 
        globals: {
            ...globals.browser,
            ...globals.node    // Useful if you ever use node-specific globals
        } 
    },
    // ADD THIS SECTION BELOW
    rules: {
        "no-unused-vars": "off",    // Stops underlining handleCardClick
        "no-undef": "error"         // Keeps underlining concole.error
    }
  },
  { files: ["**/*.js"], languageOptions: { sourceType: "script" } },
]);