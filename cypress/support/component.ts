// ============================================================================
// Cypress Component Support File
// ============================================================================

import './commands';

// Import Angular testing utilities
import { mount } from 'cypress/angular';

Cypress.Commands.add('mount', mount);

declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount;
    }
  }
}
