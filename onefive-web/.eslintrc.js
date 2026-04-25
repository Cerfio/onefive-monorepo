module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: ['plugin:@typescript-eslint/eslint-recommended', 'plugin:@typescript-eslint/recommended', 'prettier'],
  root: true,
  ignorePatterns: ['**/*.d.ts'],
  env: {
    node: true,
    jest: true,
  },
  rules: {
    'no-console': [
      'warn',
      {
        allow: ['error', 'warn'],
      },
    ],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'no-multiple-empty-lines': [
      'warn',
      {
        max: 2,
        maxEOF: 1,
        maxBOF: 0,
      },
    ],
    'no-use-before-define': 'off',
    '@typescript-eslint/no-use-before-define': [
      'error',
      {
        variables: false,
        functions: false,
      },
    ],
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        ignoreRestSiblings: true,
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/no-require-imports': 'off',
    '@typescript-eslint/no-empty-object-type': 'warn',
    '@typescript-eslint/no-unused-expressions': 'warn',
    '@typescript-eslint/no-unnecessary-type-constraint': 'warn',
    '@typescript-eslint/ban-ts-comment': 'warn',
    'prefer-const': 'warn',
    // Bloque les imports shadcn déjà migrés vers Untitled UI.
    // Whitelist customs OneFive (flag, saas-selector, animated-number,
    // searchbar-bar, social-button, social-logos) et composants pas encore
    // migrés (alert, button-group, command, dropdown-menu, form, hover-card,
    // input-search, label, modal, pagination, placeholder, popover, progress,
    // sheet, slider, spinner, tabs, textareaAutoresize) restent autorisés.
    'no-restricted-imports': [
      'error',
      {
        paths: [
          { name: '@/components/ui/skeleton', message: 'Use @/components/base/skeleton/skeleton' },
          { name: '@/components/ui/separator', message: 'Use @/components/base/separator/separator' },
          { name: '@/components/ui/tooltip', message: 'Use @/components/base/tooltip/tooltip' },
          { name: '@/components/ui/textarea', message: 'Use @/components/base/textarea/textarea' },
          { name: '@/components/ui/text-area', message: 'Use @/components/base/textarea/textarea' },
          { name: '@/components/ui/input', message: 'Use @/components/base/input/input (file inputs: <input type="file">)' },
          { name: '@/components/ui/badge', message: 'Use @/components/base/badges/badges' },
          { name: '@/components/ui/button', message: 'Use @/components/base/buttons/button' },
          { name: '@/components/ui/avatar', message: 'Use @/components/base/avatar/avatar' },
          { name: '@/components/ui/checkbox', message: 'Use @/components/base/checkbox/checkbox' },
          { name: '@/components/ui/switch', message: 'Use Toggle from @/components/base/toggle/toggle' },
          { name: '@/components/ui/radio-group', message: 'Use RadioGroup/RadioButton from @/components/base/radio-buttons/radio-buttons' },
          { name: '@/components/ui/select', message: 'Use @/components/base/select/select' },
          { name: '@/components/ui/card', message: 'Use @/components/base/card/card' },
          { name: '@/components/ui/dialog', message: 'Use @/components/base/dialog/dialog' },
          { name: '@/components/ui/alert-dialog', message: 'Use @/components/base/dialog/alert-dialog' },
          { name: '@/components/ui/tabs', message: 'Use @/components/base/tabs/tabs' },
          { name: '@/components/ui/label', message: 'Use @/components/base/label/label' },
          { name: '@/components/ui/alert', message: 'Use @/components/base/alert/alert' },
          { name: '@/components/ui/dropdown-menu', message: 'Use Dropdown from @/components/base/dropdown/dropdown' },
        ],
      },
    ],
  },
  overrides: [
    {
      files: ['src/lib/utils/clx/**/*.ts', 'src/lib/utils/clx/**/*.tsx'],
      rules: {
        '@typescript-eslint/ban-types': 'off',
      },
    },
  ],
};
