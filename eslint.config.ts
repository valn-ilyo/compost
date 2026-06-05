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
      // Components must be PascalCase in templates
      "vue/component-name-in-template-casing": [
        "error",
        "PascalCase",
        {
          registeredComponentsOnly: false,
        },
      ],

      // Filename must match the default export component name
      "vue/match-component-file-name": [
        "error",
        {
          extensions: ["vue"],
          shouldMatchCase: true,
        },
      ],

      // Props defined in script must be camelCase
      "vue/prop-name-casing": ["error", "camelCase"],

      // Props in templates must be kebab-case
      "vue/attribute-hyphenation": ["error", "always"],

      // v-on listeners in templates must be kebab-case
      "vue/v-on-event-hyphenation": ["error", "always"],

      // Emit event names must be camelCase
      "vue/custom-event-name-casing": ["error", "camelCase"],

      // No unused component registrations
      "vue/no-unused-vars": "error",

      // Enforce defineProps then defineEmits at top of <script setup>
      "vue/define-macros-order": [
        "error",
        {
          order: ["defineProps", "defineEmits"],
        },
      ],

      // No duplicate component registrations
      "vue/no-dupe-keys": "error",

      // Boolean variables/params must carry a semantic boolean prefix.
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
