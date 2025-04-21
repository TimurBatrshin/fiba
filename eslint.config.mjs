// eslint.config.mjs
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config} */
export default defineConfig([
  // Базовая конфигурация для всех файлов
  {
    name: 'fiba/base',
    ignores: ['**/node_modules/**', '**/dist/**', '**/coverage/**'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly',
        console: 'readonly'
      }
    },
    rules: {
      // Базовые правила для всего проекта
      'no-console': 'warn',
      'no-unused-vars': 'warn',
      'no-undef': 'error',
      'semi': ['error', 'always'],
      'quotes': ['error', 'single'],
      'prefer-const': 'error'
    }
  },
  
  // Правила для TypeScript файлов
  {
    name: 'fiba/typescript',
    files: ['**/*.ts', '**/*.tsx'],
    ...tseslint.configs.recommended,
    rules: {
      // Дополнительные правила для TypeScript
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }]
    }
  },
  
  // Правила для тестов
  {
    name: 'fiba/tests',
    files: ['**/*.test.ts', '**/*.test.tsx', '**/__tests__/**/*.ts', '**/__tests__/**/*.tsx'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off'
    }
  }
]); 