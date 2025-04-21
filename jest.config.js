module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/src/__mocks__/fileMock.js',
  },
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
    }],
  },
  testMatch: ['**/__tests__/**/*.+(ts|tsx|js)', '**/?(*.)+(spec|test).+(ts|tsx|js)'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.tsx',
    '!src/reportWebVitals.ts',
    '!src/__mocks__/**',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/*.mock.{ts,tsx}',
    '!src/types/**/*',
    '!src/constants/**/*',
    '!**/node_modules/**',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/__mocks__/',
    '/__fixtures__/',
  ],
  coverageThreshold: {
    global: {
      branches: 30,
      functions: 30,
      lines: 30,
      statements: 30,
    },
    // Рекомендуемые значения для критических компонентов
    "src/components/AdminPanel.tsx": {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    "src/services/**/*.ts": {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },
  coverageReporters: ['json', 'lcov', 'text', 'clover', 'html'],
  reporters: process.env.CI 
    ? ['default', 'jest-junit'] 
    : ['default'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
  ],
  // Директория для сохранения отчетов о покрытии
  coverageDirectory: '<rootDir>/coverage',
}; 