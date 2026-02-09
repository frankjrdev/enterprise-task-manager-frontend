// ============================================================================
// Navigation Module - Barrel Export
// ============================================================================
// PROPOSITO: Punto de entrada unico para el dominio de navegacion.
//
// POR QUE barrel exports:
// - Clean imports: import { BreadcrumbStore } from '@core/navigation'
// - Encapsulacion: Exponer solo lo necesario
// - Refactoring: Cambiar internos sin afectar consumers
//
// ESTRUCTURA:
// - Models: Interfaces y tipos
// - Stores: Estado reactivo con signals
// - (Futuro) Services: Logica de negocio si se necesita
// ============================================================================

// Models - Public interfaces
export type { Breadcrumb, BreadcrumbRouteConfig } from './models/breadcrumb.model';
export { isBreadcrumbRouteConfig } from './models/breadcrumb.model';

export type { PageContext, PageContextRouteConfig, SearchState } from './models/page-context.model';
export {
  createPageContext,
  DEFAULT_PAGE_CONTEXT,
  isPageContextRouteConfig,
} from './models/page-context.model';

// Stores - Reactive state management
export { BreadcrumbStore } from './stores/breadcrumb.store';
export { PageContextStore } from './stores/page-context.store';
