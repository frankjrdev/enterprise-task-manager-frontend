/**
 * Single breadcrumb entry for navigation.
 */
export interface Breadcrumb {
  readonly label: string;
  readonly url: string;
  readonly icon?: string;
  readonly isActive: boolean;
}

/**
 * Route-level breadcrumb configuration.
 */
export interface BreadcrumbRouteConfig {
  readonly label: string | ((params: Record<string, string>) => string);
  readonly icon?: string;
  readonly skip?: boolean;
}

/**
 * Type guard for breadcrumb route config.
 */
export function isBreadcrumbRouteConfig(value: unknown): value is BreadcrumbRouteConfig {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const config = value as Record<string, unknown>;

  return typeof config['label'] === 'string' || typeof config['label'] === 'function';
}
