import pluginVue from 'eslint-plugin-vue'
import vueTsEslintConfig from '@vue/eslint-config-typescript'
import eslintConfigPrettier from 'eslint-config-prettier'
import oxlint from 'eslint-plugin-oxlint'

export default [
  // ── Global ignores ────────────────────────────────────────────────────────
  {
    ignores: ['dist/**', 'node_modules/**', '*.config.js', 'public/**'],
  },

  // ── Vue recommended ───────────────────────────────────────────────────────
  ...pluginVue.configs['flat/recommended'],
  ...vueTsEslintConfig(),

  // ── Naming convention rules (playbook) ───────────────────────────────────
  {
    files: ['src/**/*.vue', 'src/**/*.ts'],
    rules: {
      // Components must be PascalCase in templates
      'vue/component-name-in-template-casing': ['error', 'PascalCase', {
        registeredComponentsOnly: false,
      }],

      // Filename must match the default export component name
      'vue/match-component-file-name': ['error', {
        extensions: ['vue'],
        shouldMatchCase: true,
      }],

      // Props defined in script must be camelCase
      'vue/prop-name-casing': ['error', 'camelCase'],

      // Props in templates must be kebab-case
      'vue/attribute-hyphenation': ['error', 'always'],

      // v-on listeners in templates must be kebab-case
      'vue/v-on-event-hyphenation': ['error', 'always'],

      // Emit event names must be kebab-case
      'vue/custom-event-name-casing': ['error', 'camelCase'],

      // No unused component registrations
      'vue/no-unused-vars': 'error',

      // Enforce defineEmits/defineProps at top of <script setup>
      'vue/define-macros-order': ['error', {
        order: ['defineProps', 'defineEmits'],
      }],

      // No duplicate component registrations
      'vue/no-dupe-keys': 'error',

      // TS: enforce camelCase for variables (catches booleans missing is/has prefix at lint time)
      '@typescript-eslint/naming-convention': [
        'warn',
        {
          selector: 'variable',
          types: ['boolean'],
          format: ['camelCase'],
          prefix: ['is', 'has', 'can', 'should', 'show', 'enable', 'allow'],
        },
        {
          selector: 'parameter',
          types: ['boolean'],
          format: ['camelCase'],
          prefix: ['is', 'has', 'can', 'should', 'show', 'enable', 'allow'],
        },
      ],
    },
  },

  // ── Prettier must be last to override formatting rules ───────────────────
  eslintConfigPrettier,
  oxlint.buildFromOxlintConfigFile('.oxlintrc.json'),
]
