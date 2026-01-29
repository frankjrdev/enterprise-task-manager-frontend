// ============================================================================
// Cypress Custom Commands
// ============================================================================

// Login command
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login');
  cy.get('[data-testid="email-input"]').type(email);
  cy.get('[data-testid="password-input"]').type(password);
  cy.get('[data-testid="login-button"]').click();
  cy.url().should('include', '/dashboard');
});

// Visit app command
Cypress.Commands.add('visitApp', () => {
  cy.visit('/');
});

// Get by test id command
Cypress.Commands.add('getByTestId', (selector: string) => {
  cy.get(`[data-testid="${selector}"]`);
});

declare namespace Cypress {
  interface Chainable {
    login(email: string, password: string): Chainable<void>;
    visitApp(): Chainable<void>;
    getByTestId(selector: string): Chainable<JQuery<HTMLElement>>;
  }
}
