// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Объявляем пространство имен для Cypress
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login a user via API
       * @example cy.login('test@example.com', 'password123')
       */
      login(email: string, password: string): Chainable<void>;

      /**
       * Custom command to create a session with token in localStorage
       * @example cy.loginByToken('fake-jwt-token')
       */
      loginByToken(token: string): Chainable<void>;

      /**
       * Custom command to select by data-cy attribute
       * @example cy.dataCy('greeting')
       */
      dataCy(value: string): Chainable<JQuery<HTMLElement>>;
    }
  }
}

// Команда для авторизации через API
Cypress.Commands.add('login', (email, password) => {
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: { email, password },
  }).then((response) => {
    expect(response.status).to.eq(200);
    
    // Сохраняем токен в localStorage
    window.localStorage.setItem('token', response.body.token);
    
    // Сохраняем информацию о пользователе в localStorage
    if (response.body.user) {
      window.localStorage.setItem('user', JSON.stringify(response.body.user));
    }
  });
});

// Команда для авторизации через установку токена
Cypress.Commands.add('loginByToken', (token) => {
  window.localStorage.setItem('token', token);
  
  // Опционально: можно добавить имитацию данных пользователя
  window.localStorage.setItem('user', JSON.stringify({
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
  }));
});

// Команда для выбора элементов через data-cy атрибут
Cypress.Commands.add('dataCy', (value) => {
  return cy.get(`[data-cy=${value}]`);
});

// Включаем автодополнение для команд
export {}; 