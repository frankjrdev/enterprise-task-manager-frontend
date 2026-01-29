// ============================================================================
// Example E2E Test - Application Flow
// ============================================================================

describe('Enterprise Task Manager - Application Flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display the application', () => {
    cy.get('app-root').should('exist');
  });

  it('should navigate to login page', () => {
    cy.url().should('include', '/login');
  });

  describe('Authentication Flow', () => {
    it('should display login form', () => {
      cy.get('[data-testid="login-form"]').should('exist');
      cy.get('[data-testid="email-input"]').should('be.visible');
      cy.get('[data-testid="password-input"]').should('be.visible');
      cy.get('[data-testid="login-button"]').should('be.visible');
    });

    it('should show error message for invalid credentials', () => {
      cy.get('[data-testid="email-input"]').type('test@example.com');
      cy.get('[data-testid="password-input"]').type('wrongpassword');
      cy.get('[data-testid="login-button"]').click();
      cy.get('[data-testid="error-message"]').should('be.visible');
    });

    it('should navigate to dashboard on successful login', () => {
      // This would require a valid test user in your backend
      cy.login('user@example.com', 'password123');
      cy.url().should('include', '/dashboard');
      cy.get('[data-testid="dashboard-header"]').should('exist');
    });
  });

  describe('Dashboard Navigation', () => {
    beforeEach(() => {
      cy.login('user@example.com', 'password123');
    });

    it('should display dashboard sidebar', () => {
      cy.get('[data-testid="sidebar"]').should('be.visible');
      cy.get('[data-testid="nav-tasks"]').should('exist');
      cy.get('[data-testid="nav-profile"]').should('exist');
    });

    it('should navigate between pages', () => {
      cy.get('[data-testid="nav-tasks"]').click();
      cy.url().should('include', '/tasks');
      cy.get('[data-testid="tasks-header"]').should('be.visible');
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      cy.get('h1').should('exist');
    });

    it('should have accessible form inputs', () => {
      cy.get('[data-testid="email-input"]').should('have.attr', 'aria-label');
      cy.get('[data-testid="password-input"]').should('have.attr', 'aria-label');
    });
  });
});
