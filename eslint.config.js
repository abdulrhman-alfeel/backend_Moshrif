const js = require('@eslint/js');

module.exports = [
  js.configs.recommended,
  {
    ignores: [
      'node_modules/**',
      'upload/**',
      'logs/**',
      'build/**',
      'DashbordMoshrif/**',
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-console': 'off'
    }
  }
];
