// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Add a custom command to login
Cypress.Commands.add('login', (username: string, password: string) => {
  cy.visit('/signin');
  cy.get('[data-testid=username]').type(username);
  cy.get('[data-testid=password]').type(password);
  cy.get('[data-testid=signin-button]').click();
  // Wait for login to complete
  cy.url().should('not.include', '/signin');
});

// Custom command to set local storage
Cypress.Commands.add('setLocalStorage', (key: string, value: string) => {
  cy.window().then((window) => {
    window.localStorage.setItem(key, value);
  });
});

// Custom command to get local storage
Cypress.Commands.add('getLocalStorage', (key: string) => {
  cy.window().then((window) => {
    return window.localStorage.getItem(key);
  });
});

// Declare global Cypress namespace to include custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      login(username: string, password: string): Chainable<void>;
      setLocalStorage(key: string, value: string): Chainable<void>;
      getLocalStorage(key: string): Chainable<string | null>;
    }
  }
} 