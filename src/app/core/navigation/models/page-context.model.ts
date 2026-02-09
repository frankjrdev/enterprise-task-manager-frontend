/**
 * Current page context used by UI components.
 */
export interface PageContext {
  readonly pageTitle: string;
  readonly pageId: string;
  readonly searchPlaceholder: string;
  readonly searchEnabled: boolean;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * Route-level context configuration.
 */
export interface PageContextRouteConfig {
  readonly title: string;
  readonly searchPlaceholder?: string;
  readonly searchDisabled?: boolean;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * Search state stored separately from the page context.
 */
export interface SearchState {
  readonly query: string;
  readonly isSearching: boolean;
  readonly results: readonly unknown[];
  readonly error: string | null;
}

/**
 * Creates a page context with defaults.
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
 * Default page context used without route config.
 */
export const DEFAULT_PAGE_CONTEXT: PageContext = createPageContext({
  pageTitle: 'Dashboard',
  pageId: '/dashboard',
  searchPlaceholder: 'Search...',
  searchEnabled: true,
});

/**
 * Type guard for page context route config.
 */
export function isPageContextRouteConfig(value: unknown): value is PageContextRouteConfig {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const config = value as Record<string, unknown>;
  return typeof config['title'] === 'string';
}
