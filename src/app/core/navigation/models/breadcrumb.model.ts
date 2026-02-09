/**
 * Represents an individual element in the breadcrumb navigation.
 *
 * @example
 * const breadcrumb: Breadcrumb = {
 *   label: 'Projects',
 *   url: '/dashboard/projects',
 *   icon: 'folder',
 *   isActive: false
 * };
 */
export interface Breadcrumb {
  /**
   * Visible text of the breadcrumb.
   * Can be static or dynamic (e.g., project name).
   */
  readonly label: string;

  /**
   * Complete navigation URL.
   * Used with routerLink for SPA navigation (without a reload).
   */
  readonly url: string;

  /**
   * Optional Material icon (e.g., 'home', 'folder', 'description').
   * Improves visual UX and accessibility.
   */
  readonly icon?: string;

  /**
   * Indicates if this is the currently active breadcrumb (last in the chain).
   * Active breadcrumbs are not clickable and have different styling.
   */
  readonly isActive: boolean;
}

/**
 * Breadcrumb configuration in the route.
 * Defined in the `data` object of Angular Routes.
 *
 * WHY use route `data`:
 * - Single source of truth: Configuration alongside the route
 * - Lazy loading compatible: Loads with the module
 * - Type-safe with this interface
 *
 * @example
 * // In app.routes.ts
 * {
 *   path: 'projects',
 *   data: {
 *     breadcrumb: {
 *       label: 'Projects',
 *       icon: 'folder'
 *     }
 *   } satisfies { breadcrumb: BreadcrumbRouteConfig },
 *   loadComponent: () => import('./projects/projects')
 * }
 */
export interface BreadcrumbRouteConfig {
  /**
   * Static label or function that receives params and returns a label.
   * The function allows dynamic breadcrumbs (e.g., "Project: {name}").
   */
  readonly label: string | ((params: Record<string, string>) => string);

  /**
   * Optional Material icon for this level.
   */
  readonly icon?: string;

  /**
   * If true, this level won't appear in breadcrumbs.
   * Useful for intermediate routes like '/dashboard' when you only want 'Home > Projects'.
   */
  readonly skip?: boolean;
}

/**
 * Type guard to verify if a value is BreadcrumbRouteConfig.
 *
 * WHY it's necessary:
 * - Route `data` is `any` by default in Angular
 * - This guard provides type safety at runtime
 * - Prevents silent errors if the config is malformed
 *
 * HOW it works:
 * - TypeScript's type narrowing: After the guard, the type is known
 * - The guard verifies the structure at runtime
 */
export function isBreadcrumbRouteConfig(value: unknown): value is BreadcrumbRouteConfig {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const config = value as Record<string, unknown>;

  // label is required and must be string or function

  return typeof config['label'] === 'string' || typeof config['label'] === 'function';
}
