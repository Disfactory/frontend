module.exports = {
  root: true,
  env: {
    node: true
  },
  plugins: ['testing-library', 'jest-dom'],
  'extends': [
    'plugin:vue/essential',
    '@vue/standard',
    '@vue/typescript/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:testing-library/vue',
    'plugin:jest-dom/recommended'
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    quotes: 'off',
    '@typescript-eslint/quotes': ['error', 'single'],
    '@typescript-eslint/explicit-function-return-type': 'off',
    'semi': 'off',
    '@typescript-eslint/semi': ['error', 'never'],
    'no-unused-expressions': 'off',
    'no-use-before-define': 'warn',
    '@typescript-eslint/no-unused-expressions': 'error',
    '@typescript-eslint/member-delimiter-style': ['error', { multiline: { delimiter: 'comma', requireLast: false }, singleline: { delimiter: 'comma', requireLast: false }, overrides: { interface: { multiline: { delimiter: 'none' } } } }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unsafe-argument': 'warn',
    '@typescript-eslint/no-unsafe-assignment': 'warn',
    '@typescript-eslint/no-unsafe-call': 'warn',
    '@typescript-eslint/no-unsafe-member-access': 'warn',
    '@typescript-eslint/no-unsafe-return': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/require-await': 'off', // TODO: can remove on 11/25
    '@typescript-eslint/ban-types': 'warn',
    '@typescript-eslint/no-floating-promises': 'warn',
    'vue/return-in-computed-property': 'warn',
    '@typescript-eslint/no-misused-promises': 'warn',
    '@typescript-eslint/no-non-null-asserted-optional-chain': 'warn',
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
    extraFileExtensions: ['.vue']
  },
  overrides: [
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)'
      ],
      env: {
        jest: true
      }
    }
  ]
}
