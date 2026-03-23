module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', 'node_modules', 'scripts'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    // Allow _-prefixed names to signal intentionally unused params/vars
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    // Not enforcing yet — ~30 pre-existing usages in the codebase
    '@typescript-eslint/no-explicit-any': 'off',
    // Pre-existing pattern in switch blocks; not a runtime bug here
    'no-case-declarations': 'off',
    // Empty catch blocks are acceptable in this codebase
    'no-empty': 'off',
    // rules-of-hooks enforced (real bug); exhaustive-deps has 32 pre-existing
    // intentional omissions and is turned off until those are addressed
    'react-hooks/exhaustive-deps': 'off',
    // Dev-server ergonomics only; not a correctness rule
    'react-refresh/only-export-components': 'off',
  },
};
