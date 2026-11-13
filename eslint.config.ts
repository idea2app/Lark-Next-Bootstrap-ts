import { defineConfig } from 'eslint/config';
import NextJS from 'eslint-idea2app-next-js';

export default defineConfig(...NextJS, {
  rules: {
    'arrow-body-style': ['error', 'as-needed'],
    'no-empty-pattern': 'warn',
    'no-console': ['error', { allow: ['warn', 'error', 'info', 'table'] }],
    'consistent-return': 'warn',
    'prefer-const': 'warn',
    'prefer-destructuring': ['error', { object: true, array: true }],
  },
});
