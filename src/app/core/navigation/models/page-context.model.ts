// ============================================================================
// Page Context Model - Interface Definition
// ============================================================================
// PURPOSE: Define the page context that the Header needs to know.
//
// ARCHITECTURE - Separation of Concerns:
// - PageContext: UI state (title, placeholder)
// - SearchConfig: Search configuration (delegated to another model)
// - Breadcrumbs: Navigation (in its own model)
//
// WHY this separation:
// - Single Responsibility: Each model has a clear purpose
// - Testability: Small models = simple tests
// - Flexibility: Pages can have context without search
// ============================================================================

/**
 * Current page context.
 * Contains information that the Header and other components need.
 *
 * IMMUTABILITY:
 * - All fields are readonly
 * - Changes create new instances (signals a pattern)
 * - Prevents accidental mutations and subtle bugs
 */
export interface PageContext {
  /**
   * Title of the current page.
   * Shown in the header and can be used for document.title.
   */
  readonly pageTitle: string;

  /**
   * Unique identifier of the page.
   * Used to register/search handlers.
   *
   * @example '/dashboard/projects', '/dashboard/tasks'
   */
  readonly pageId: string;

  /**
   * Placeholder for the search input.
   * Customized per page for better UX.
   */
  readonly searchPlaceholder: string;

  /**
   * Indicates whether search is enabled on this page.
   * Some pages (e.g., Settings) may not need search.
   */
  readonly searchEnabled: boolean;

  /**
   * Additional page-specific metadata.
   * Extensible without modifying the base interface.
   *
   * @example { showNewTaskButton: true, taskCount: 42 }
   */
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * Route context configuration.
 * Similar to BreadcrumbRouteConfig, defined in `data`.
 *
 * DIFFERENCE with PageContext:
 * - RouteConfig: Static/declarative configuration in routes
 * - PageContext: Runtime state derived from the config
 */
export interface PageContextRouteConfig {
  /**
   * Page title (required).
   */
  readonly title: string;

  /**
   * Custom search placeholder.
   * Default: 'Search...'
   */
  readonly searchPlaceholder?: string;

  /**
   * Disable search for this page.
   * Default: false (search enabled)
   */
  readonly searchDisabled?: boolean;

  /**
   * Additional metadata.
   */
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * Reactive search state.
 * Separate from PageContext to allow independent updates.
 *
 * WHY separate:
 * - The search query changes frequently (every keystroke)
 * - The page context changes only on navigation
 * - Granular signals = fewer re-renders
 */
export interface SearchState {
  /**
   * Current search query (controlled by the user).
   */
  readonly query: string;

  /**
   * Indicates whether a search is in progress.
   */
  readonly isSearching: boolean;

  /**
   * Search results (generic).
   * Each page defines its result type.
   */
  readonly results: readonly unknown[];

  /**
   * Search error if it occurred.
   */
  readonly error: string | null;
}

/**
 * Factory to create PageContext with defaults.
 *
 * WHY use a factory:
 * - Encapsulates default logic
 * - Ensures valid objects
 * - Single point of creation = easy to modify
 */
export function createPageContext(
  config: Partial<PageContext> & Pick<PageContext, 'pageTitle' | 'pageId'>,
): PageContext {
  return {
    pageTitle: config.pageTitle,
    pageId: config.pageId,
    searchPlaceholder: config.searchPlaceholder ?? 'Search...',
    searchEnabled: config.searchEnabled ?? true,
    metadata: config.metadata,
  };
}

/**
 * Default PageContext.
 * Used when there is no route configuration.
 */
export const DEFAULT_PAGE_CONTEXT: PageContext = createPageContext({
  pageTitle: 'Dashboard',
  pageId: '/dashboard',
  searchPlaceholder: 'Search...',
  searchEnabled: true,
});

/**
 * Type guard for PageContextRouteConfig.
 */
export function isPageContextRouteConfig(value: unknown): value is PageContextRouteConfig {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const config = value as Record<string, unknown>;
  return typeof config['title'] === 'string';
}
