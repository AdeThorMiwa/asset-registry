import { defineConfig } from "eslint/config";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

export default defineConfig([
    {
        ignores: ["node_modules/*", "dist/*", "prisma/*"],
    },
    {
        extends: compat.extends(
            "eslint:recommended",
            "plugin:@typescript-eslint/eslint-recommended",
            "plugin:@typescript-eslint/recommended",
        ),

        plugins: {
            "@typescript-eslint": typescriptEslint,
        },

        languageOptions: {
            parser: tsParser,
        },

        rules: {
            "no-console": 2,

            "no-empty": ["error", {
                allowEmptyCatch: true,
            }],

            curly: ["error", "all"],

            eqeqeq: ["error", "always", {
                null: "ignore",
            }],

            "no-caller": "error",
            "no-new": "error",
            "no-with": "error",

            "brace-style": ["error", "1tbs", {
                allowSingleLine: true,
            }],

            "comma-dangle": ["error", "always-multiline"],
            "comma-style": ["error", "last"],
            "func-call-spacing": ["error", "never"],
            indent: "off",
            "no-trailing-spaces": "error",

            "key-spacing": ["error", {
                beforeColon: false,
                afterColon: true,
            }],

            "keyword-spacing": "error",

            "new-cap": ["off", {
                capIsNewExceptions: ["PublishEvent"],
            }],

            "no-bitwise": "error",

            "space-before-function-paren": ["error", {
                anonymous: "ignore",
                named: "never",
            }],

            "space-infix-ops": "error",

            "space-unary-ops": ["error", {
                words: false,
                nonwords: false,
            }],

            "no-use-before-define": ["error", {
                functions: false,
            }],

            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": "error",

            "sort-imports": ["error", {
                ignoreCase: false,
                ignoreDeclarationSort: true,
                ignoreMemberSort: false,
            }],


            "@typescript-eslint/no-require-imports": "error",
        },
    },
]);