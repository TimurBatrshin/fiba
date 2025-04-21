describe('Authentication', () => {
  beforeEach(() => {
    // Reset and visit the home page before each test
    cy.visit('/');
  });

  it('should navigate to sign in page', () => {
    // Find and click the sign in button
    cy.get('[data-testid=header-signin-button]').click();
    
    // Verify that we've navigated to the sign-in page
    cy.url().should('include', '/signin');
    cy.get('[data-testid=signin-form]').should('be.visible');
  });

  it('should show validation errors with empty credentials', () => {
    // Navigate to sign in page
    cy.visit('/signin');
    
    // Try to sign in without filling the form
    cy.get('[data-testid=signin-button]').click();
    
    // Verify that validation errors are shown
    cy.get('[data-testid=username-error]').should('be.visible');
    cy.get('[data-testid=password-error]').should('be.visible');
  });

  it('should show error message with invalid credentials', () => {
    // Navigate to sign in page
    cy.visit('/signin');
    
    // Fill in invalid credentials
    cy.get('[data-testid=username]').type('invalid@example.com');
    cy.get('[data-testid=password]').type('wrongpassword');
    
    // Submit the form
    cy.get('[data-testid=signin-button]').click();
    
    // Verify that an error message is shown
    cy.get('[data-testid=auth-error-message]').should('be.visible');
  });

  // This test would require a mock server or valid test credentials
  // it('should login successfully with valid credentials', () => {
  //   cy.visit('/signin');
  //   cy.get('[data-testid=username]').type('test@example.com');
  //   cy.get('[data-testid=password]').type('password123');
  //   cy.get('[data-testid=signin-button]').click();
  //   cy.url().should('not.include', '/signin');
  //   cy.get('[data-testid=user-menu]').should('be.visible');
  // });

  it('should navigate to sign up page', () => {
    cy.visit('/signin');
    cy.get('[data-testid=signup-link]').click();
    cy.url().should('include', '/signup');
    cy.get('[data-testid=signup-form]').should('be.visible');
  });
}); 