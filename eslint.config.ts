// ESLint flat config -- Vue 3, TypeScript, Oxlint, and Prettier for the Compost app
import { globalIgnores } from "eslint/config";
import { defineConfigWithVueTs, vueTsConfigs } from "@vue/eslint-config-typescript";
import pluginVue from "eslint-plugin-vue";
import pluginOxlint from "eslint-plugin-oxlint";
import skipFormatting from "eslint-config-prettier/flat";

export default defineConfigWithVueTs(
  {
    name: "app/files-to-lint",
    files: ["**/*.{vue,ts,mts,tsx}"],
  },

  globalIgnores(["**/dist/**", "**/dist-ssr/**", "**/coverage/**", "**/public/**"]),

  ...pluginVue.configs["flat/recommended"],
  vueTsConfigs.recommended,

  {
    name: "app/vue-ts-rules",
    files: ["src/**/*.vue", "src/**/*.ts"],
    rules: {
      "vue/component-name-in-template-casing": [
        "error",
        "PascalCase",
        {
          registeredComponentsOnly: false,
        },
      ],

      "vue/match-component-file-name": [
        "error",
        {
          extensions: ["vue"],
          shouldMatchCase: true,
        },
      ],

      "vue/prop-name-casing": ["error", "camelCase"],

      "vue/attribute-hyphenation": ["error", "always"],

      "vue/v-on-event-hyphenation": ["error", "always"],

      "vue/custom-event-name-casing": ["error", "camelCase"],

      "vue/no-unused-vars": "error",

      "vue/define-macros-order": [
        "error",
        {
          order: ["defineProps", "defineEmits"],
        },
      ],

      "vue/no-dupe-keys": "error",

      // Note: @typescript-eslint trims the prefix before format-checking, so
      // `isActive` → trim `is` → `Active` → must be PascalCase (not camelCase).
      "@typescript-eslint/naming-convention": [
        "warn",
        {
          selector: "variable",
          types: ["boolean"],
          format: ["PascalCase"],
          prefix: ["is", "has", "can", "should", "show", "enable", "allow", "did", "was", "does"],
        },
        {
          selector: "parameter",
          types: ["boolean"],
          format: ["PascalCase"],
          prefix: ["is", "has", "can", "should", "show", "enable", "allow", "did", "was", "does"],
        },
      ],
    },
  },

  ...pluginOxlint.buildFromOxlintConfigFile(".oxlintrc.json"),

  skipFormatting,
);
