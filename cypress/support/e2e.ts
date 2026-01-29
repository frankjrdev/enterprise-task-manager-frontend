// ============================================================================
// Cypress E2E Support File
// ============================================================================

// Import commands.js using ES2015 syntax:
import './commands';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Hide fetch/XHR requests from command log
const app = window.top;

if (app) {
  app.document.addEventListener('click', () => {
    app.console.log('A click was detected');
  });
}

// Prevent Cypress from failing on uncaught exceptions
Cypress.on('uncaught:exception', (err, runnable) => {
  return false;
});
