import baseConfig from './src/config/eslint.js';

export default [
  ...baseConfig,
  {
    ignores: ['node_modules/**', 'dist/**', 'coverage/**'],
  },
];
