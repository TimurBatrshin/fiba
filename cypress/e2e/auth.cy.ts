describe('Authentication Tests', () => {
  beforeEach(() => {
    // Очищаем localStorage перед каждым тестом
    cy.clearLocalStorage();
  });

  it('should allow admin to log in', () => {
    cy.visit('/login');
    
    cy.get('[data-cy=email-input]').type('admin@admin.ru');
    cy.get('[data-cy=password-input]').type('Timur007.,');
    cy.get('[data-cy=login-button]').click();
    
    // Проверяем, что перенаправило на дашборд или домашнюю страницу
    cy.url().should('not.include', '/login');
    
    // Проверяем, что токен был сохранен
    cy.window().its('localStorage.token').should('exist');
    
    // Проверяем, что кнопка выхода видна
    cy.get('[data-cy=logout-button]').should('exist');
    
    // Проверяем наличие ссылки на профиль для авторизованного пользователя
    cy.get('.nav-link').contains('Профиль').should('exist');
  });
  
  it('should allow regular user to log in', () => {
    cy.visit('/login');
    
    cy.get('[data-cy=email-input]').type('user@user.ru');
    cy.get('[data-cy=password-input]').type('Timur007.,');
    cy.get('[data-cy=login-button]').click();
    
    // Проверяем, что перенаправило на дашборд или домашнюю страницу
    cy.url().should('not.include', '/login');
    
    // Проверяем, что токен был сохранен
    cy.window().its('localStorage.token').should('exist');
    
    // Проверяем, что кнопка выхода видна
    cy.get('[data-cy=logout-button]').should('exist');
  });
  
  it('should display validation errors for invalid login', () => {
    cy.visit('/login');
    
    // Пытаемся войти с неверными данными
    cy.get('[data-cy=email-input]').type('wrong@example.com');
    cy.get('[data-cy=password-input]').type('wrongpassword');
    cy.get('[data-cy=login-button]').click();
    
    // Проверяем наличие сообщения об ошибке
    cy.get('[data-cy=error-message]').should('be.visible');
  });

  it('should allow a user to log out', () => {
    // Устанавливаем токен, чтобы имитировать залогиненного пользователя
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'fake-jwt-token');
      
      // Также можно установить пользователя в localStorage если нужно
      win.localStorage.setItem('user', JSON.stringify({
        id: 1,
        email: 'admin@admin.ru',
        name: 'Admin User'
      }));
    });

    // Заходим на главную страницу (предполагается, что пользователь уже залогинен)
    cy.visit('/');
    
    // Кликаем на кнопку выхода
    cy.get('[data-cy=logout-button]').click();

    // Проверяем, что токен был удален из localStorage
    cy.window().its('localStorage.token').should('not.exist');

    // Проверяем, что произошел редирект на страницу логина
    cy.url().should('include', '/login');
  });
  
  it('should toggle between admin and regular user accounts', () => {
    // Логин с учетной записью администратора
    cy.visit('/login');
    cy.get('[data-cy=email-input]').type('admin@admin.ru');
    cy.get('[data-cy=password-input]').type('Timur007.,');
    cy.get('[data-cy=login-button]').click();
    
    // Проверка наличия элементов администратора (если такие есть)
    cy.contains('Профиль').should('exist');
    
    // Выход из системы
    cy.get('[data-cy=logout-button]').click();
    
    // Логин с обычной учетной записью
    cy.get('[data-cy=email-input]').type('user@user.ru');
    cy.get('[data-cy=password-input]').type('Timur007.,');
    cy.get('[data-cy=login-button]').click();
    
    // Проверка доступности обычному пользователю (и отсутствия админ-функций)
    cy.contains('Профиль').should('exist');
    cy.url().should('not.include', '/admin');
  });
}); 