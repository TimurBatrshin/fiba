module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  extends: [
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  rules: {
    // Место для кастомных правил
    'react/prop-types': 'off', // Отключаем проверку propTypes, т.к. используем TypeScript
    '@typescript-eslint/explicit-module-boundary-types': 'off', // Отключаем обязательное указание возвращаемых типов
    '@typescript-eslint/no-explicit-any': 'warn', // Предупреждения при использовании any
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }], // Предупреждения при неиспользуемых переменных
    'react/react-in-jsx-scope': 'off', // React 17+ не требует импорта React в jsx файлах
  },
}; 