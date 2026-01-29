# Enterprise Task Manager - Frontend Setup Guide

## 📋 Project Overview

**Current State:** Production-ready Angular 21 scaffolding
**Tech Stack:**
- Angular 21 (Standalone Components, Signals, new flow control)
- TypeScript 5.9
- SCSS (No Tailwind - Pure SASS with custom theme system)
- Jest 29 (Unit Testing)
- Cypress 15 (E2E Testing)
- Prettier 3 (Code Formatting)
- ESLint 9 (Code Linting - in progress)
- Angular Material 21 (UI Components)
- Angular CDK 21 (Utilities)

---

## 🎨 Color Palette & Theme

### Brand Colors
```scss
$color-dark-primary: #1e1f22;    // Dark background
$color-dark-secondary: #2b2d30;  // Secondary dark
$color-accent: #e29a33;           // Orange accent
$color-white: #ffffff;            // Pure white
$color-light-gray: #d3d3d3;       // Light gray
```

### Semantic Colors
- **Success:** `#10b981` (Green)
- **Warning:** `#f59e0b` (Amber)
- **Danger:** `#ef4444` (Red)
- **Info:** `#3b82f6` (Blue)

### Accessing Theme Variables
All SCSS variables are available globally via imports:
```scss
@import 'assets/styles/variables';  // All color, typography, spacing variables
@import 'assets/styles/mixins';     // Reusable mixins
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── core/                    // Core functionality (singleton services)
│   │   ├── auth/
│   │   │   ├── guards/
│   │   │   ├── interceptors/
│   │   │   ├── services/
│   │   │   └── models/
│   │   ├── dashboard/
│   │   └── tasks/
│   ├── shared/                  // Shared components, pipes, directives
│   │   ├── auth/
│   │   ├── dashboard/
│   │   └── tasks/
│   ├── features/                // Feature modules
│   │   ├── auth/               // Login, Register
│   │   ├── dashboard/          // Dashboard, Analytics
│   │   └── tasks/              // Task management
│   ├── app.ts                  // Root component
│   ├── app.routes.ts           // Route definitions
│   └── app.config.ts           // App providers
├── assets/
│   ├── styles/
│   │   ├── _variables.scss    // Color palette, typography, spacing
│   │   ├── _mixins.scss       // Reusable SCSS patterns
│   │   └── _reset.scss        // CSS reset & normalization
│   ├── icons/
│   └── images/
├── main.ts                     // Application entry point
└── styles.scss                 // Global styles

cypress/
├── e2e/                        // End-to-end tests
│   └── app.cy.ts
└── support/
    ├── e2e.ts
    └── commands.ts
```

---

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Development Server
```bash
npm start
# Navigate to http://localhost:4200
```

### Build for Production
```bash
npm run build:prod
```

---

## 🧪 Testing

### Unit Tests (Jest)
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test:watch

# Generate coverage report
npm test:coverage

# Debug tests
npm test:debug
```

**Current Coverage:**
- App component tests passing ✓
- Test environment fully configured

### E2E Tests (Cypress)
```bash
# Open Cypress interactive mode
npm run e2e

# Run Cypress tests headless
npm run e2e:headless

# CI/CD mode (with recording)
npm run e2e:ci
```

**Test Files Location:** `cypress/e2e/*.cy.ts`

**Example Test Structure:**
- Authentication flow tests
- Dashboard navigation tests
- Accessibility tests
- User interactions

---

## 🎯 Code Quality

### Code Formatting (Prettier)
```bash
# Format all files
npm run format

# Check formatting
npm run format:check
```

**Prettier Configuration:**
- Print width: 100 characters
- Single quotes: enabled
- Trailing commas: ES5
- Tab width: 2 spaces

### Code Linting (ESLint)
```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix
```

**Configuration:** `.eslintignore` for exclusions

---

## 📦 npm Scripts Reference

| Script | Command | Description |
|--------|---------|-------------|
| `start` | `ng serve` | Start dev server (port 4200) |
| `start:prod` | `ng serve --prod` | Start dev server (production config) |
| `build` | `ng build` | Build for development |
| `build:prod` | `ng build --prod` | Build optimized for production |
| `test` | `jest` | Run all Jest tests |
| `test:watch` | `jest --watch` | Watch mode for tests |
| `test:coverage` | `jest --coverage` | Generate coverage report |
| `test:debug` | `node --inspect-brk jest` | Debug tests in Node |
| `lint` | `eslint . --ext .ts,.html` | Run ESLint |
| `lint:fix` | `eslint . --fix` | Fix ESLint issues |
| `format` | `prettier --write` | Format code with Prettier |
| `format:check` | `prettier --check` | Check formatting |
| `e2e` | `cypress open` | Open Cypress interactive |
| `e2e:headless` | `cypress run` | Run Cypress headless |
| `e2e:ci` | `cypress run --record` | CI/CD Cypress runs |
| `precommit` | `lint:fix && format` | Pre-commit hook |

---

## 🔧 Configuration Files

### TypeScript
- **tsconfig.json** - Base configuration
- **tsconfig.app.json** - App-specific config
- **tsconfig.spec.json** - Test-specific config
  - Jest types configured
  - Node types included

### Jest
- **jest.config.js** - Jest configuration
  - `jest-preset-angular` preset
  - JSDOM test environment
  - Path aliases configured
  - Coverage settings

### Angular
- **angular.json** - Angular CLI configuration
- **tsconfig.json** - TypeScript configuration

### Build & Deployment
- **.npmrc** - NPM configuration (legacy peer deps)
- **.gitignore** - Git exclusions
- **.prettierrc** - Prettier configuration
- **.prettierignore** - Prettier exclusions
- **.eslintignore** - ESLint exclusions

---

## 🎨 SCSS Utilities & Patterns

### Available Mixins

**Layout:**
```scss
@include flex-center;           // Center items with flexbox
@include flex-between;          // Space between layout
@include flex-column;           // Column layout
@include grid-center;           // Center items with grid
```

**Responsive Design:**
```scss
@include breakpoint('md') {
  // CSS rules for medium screens and up
}
```

**Typography:**
```scss
@include truncate;              // Single line truncation
@include line-clamp(3);         // Multi-line truncation
```

**Shadows & Depth:**
```scss
@include shadow('lg');          // Apply shadow level
@include elevation(2);          // Apply elevation level
```

**Transitions:**
```scss
@include transition('color', $transition-base);
@include smooth-transition;
```

### Global Utility Classes

```html
<!-- Flexbox -->
<div class="flex flex-center flex-between"></div>

<!-- Grid -->
<div class="grid grid-center"></div>

<!-- Text -->
<p class="text-center text-accent text-truncate"></p>

<!-- Typography -->
<span class="font-bold font-semibold font-medium"></span>

<!-- Background -->
<div class="bg-primary bg-secondary bg-accent"></div>

<!-- Visibility -->
<div class="hidden invisible opacity-50"></div>
```

---

## 📐 Angular 21 Modern Features Implementation

### Standalone Components
All components use Angular 21 standalone API:
```typescript
@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CommonModule, MaterialModule],
  template: `...`,
})
export class ExampleComponent {}
```

### Signals (State Management)
Modern reactive state:
```typescript
export class MyComponent {
  count = signal(0);
  double = computed(() => this.count() * 2);

  increment() {
    this.count.update(c => c + 1);
  }
}
```

### New Control Flow Syntax

**if/else:**
```html
@if (isLoggedIn()) {
  <p>Welcome back!</p>
} @else {
  <p>Please login</p>
}
```

**switch:**
```html
@switch (status()) {
  @case ('pending') { <p>Loading...</p> }
  @case ('success') { <p>Done!</p> }
  @default { <p>Error</p> }
}
```

**for:**
```html
@for (item of items(); track item.id) {
  <li>{{ item.name }}</li>
}
```

### @defer for Lazy Rendering
```html
@defer (on immediate) {
  <heavy-component />
} @placeholder {
  <p>Loading component...</p>
}
```

---

## 🔐 Security Best Practices

1. **XSS Prevention:** Angular auto-escapes bindings
2. **CSRF Protection:** Use HttpClient interceptors
3. **Secrets:** Never commit `.env` files
4. **Dependency Audits:** `npm audit` regularly

---

## 📚 Next Steps (Implementation Roadmap)

### Phase 1: Core Components ✓ Started
- [x] Project scaffold
- [x] Testing infrastructure
- [x] Theme system
- [ ] Layout shell (Sidebar, Header, Footer)
- [ ] Authentication components

### Phase 2: Features
- [ ] Login/Register pages
- [ ] Dashboard with analytics
- [ ] Task management board
- [ ] User profile

### Phase 3: Advanced
- [ ] Real-time updates (WebSockets)
- [ ] Offline support (Service Worker)
- [ ] File uploads
- [ ] Advanced filtering & search

### Phase 4: Optimization
- [ ] Performance audits
- [ ] Bundle size optimization
- [ ] Image lazy loading
- [ ] Code splitting by feature

---

## 🐛 Troubleshooting

### Port 4200 already in use
```bash
ng serve --port 4300
```

### Jest tests failing
```bash
npm install --legacy-peer-deps
npm test
```

### SCSS compilation errors
Ensure all `@import` statements use correct paths relative to file location.

### ESLint configuration issues
ESLint v9 uses flat config format. See `.eslintignore` for basic setup.

---

## 📖 Resources

- [Angular 21 Documentation](https://angular.dev)
- [TypeScript Documentation](https://www.typescriptlang.org)
- [Jest Documentation](https://jestjs.io)
- [Cypress Documentation](https://docs.cypress.io)
- [SASS/SCSS Documentation](https://sass-lang.com)
- [Angular Material](https://material.angular.io)

---

## ✅ Verification Checklist

- [x] Angular 21 project created
- [x] SCSS with custom theme (#1E1F22, #2B2D30, #E29A33, #FFFFFF, #D3D3D3)
- [x] Jest 29 configured and working (2/2 tests passing)
- [x] Cypress 15 configured for E2E testing
- [x] Prettier 3 configured and working
- [x] ESLint 9 installed (basic config)
- [x] Angular Material 21 installed
- [x] Angular CDK 21 installed
- [x] Professional folder structure created
- [x] Path aliases configured
- [x] Global styles and utilities set up
- [x] SCSS variables and mixins created
- [x] TypeScript configuration optimized
- [x] npm scripts created for common tasks

---

**Status:** ✅ Production-Ready Scaffolding Complete

All infrastructure is in place and tested. Ready to start building components and features!
