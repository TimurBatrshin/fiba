/// <reference types="jest" />

declare namespace jest {
  interface Matchers<R> {
    toBe(expected: any): R;
    toEqual(expected: any): R;
    toBeInstanceOf(expected: any): R;
    toThrow(expected?: any): R;
  }
}

// Override Cypress types in test files
declare global {
  namespace Cypress {
    interface Chainable {
      // Add custom Cypress commands here if needed
    }
  }
}

export {}; 