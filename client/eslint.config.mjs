// import js from "@eslint/js";
// import globals from "globals";
// import pluginReact from "eslint-plugin-react";
// import json from "@eslint/json";
// import { defineConfig } from "eslint/config";

// export default defineConfig([
//   { files: ["**/*.{js,mjs,cjs,jsx}"], plugins: { js }, extends: ["js/recommended"] },
//   { files: ["**/*.{js,mjs,cjs,jsx}"], languageOptions: { globals: globals.browser } },
//   pluginReact.configs.flat.recommended,
//   { files: ["**/*.json"], plugins: { json }, language: "json/json", extends: ["json/recommended"] },
// ]);

// eslint.config.js
import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import json from "@eslint/json";
import { defineConfig } from "eslint/config";

export default defineConfig([{
        files: ["**/*.{js,mjs,cjs,jsx}"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: globals.browser,
        },
        plugins: {
            js,
            react: pluginReact,
        },
        rules: {
            ...js.configs.recommended.rules,
            ...pluginReact.configs.recommended.rules,
            "no-unused-vars": "warn",
            "react/prop-types": "off", // disable if you don't use PropTypes
        },
    },
    {
        files: ["**/*.json"],
        plugins: {
            json,
        },
        languageOptions: {
            parser: json.parsers.JSON,
        },
        rules: {
            ...json.configs.recommended.rules,
        },
    },
]);