//Models for the overview metrics on the dashboard overview page.
/**
 * Types of tendencies for the overview metrics.
 */
export type TrendDirection = 'up' | 'down' | 'stable';

/**
 * Type of metriocs to determinate the color of the metric value.
 */
export type MetricType = 'default' | 'success' | 'warning' | 'danger';

/**
 * Configuration of thendecy with variation data for the overview metrics.
 */
export interface MetricTrend {
  readonly direction: TrendDirection;
  readonly value: number;
  readonly label: string;
}

/**
 * Individual metric from dashboard overview page.
 *
 * @example
 * const totalTasks: DashboardMetric = {
 *   id: 'total-tasks',
 *   title: 'TOTAL TASKS',
 *   value: 1284,
 *   icon: 'assignment',
 *   type: 'default',
 *   trend: { direction: 'up', value: 12, label: 'from last week'}
 * };
 */
export interface DashboardMetric {
  readonly id: string;
  readonly title: string;
  readonly value: number | string;
  readonly icon?: string;
  readonly type: MetricType;
  readonly trend?: MetricTrend;
  readonly subtitle?: string;
}

/**
 * Global progress metrics
 */
export interface GlobalProgressMetrics {
  readonly completionPercentage: number;
  readonly onTrackPercentage: number;
  readonly atRiskPercentage: number;
  readonly offTrackPercentage: number;
}

/**
 * Metrics filter time
 */
export type MetricsTimeFilter = '7d' | '30d' | '90d' | '6m' | '1y';

/**
 * Complete reponse for the overview metrics API endpoint.
 */
export interface OverviewMetricsResponse {
  readonly totalTasks: DashboardMetric;
  readonly activeSprints: DashboardMetric;
  readonly blockedIssues: DashboardMetric;
  readonly globalProgress: GlobalProgressMetrics;
}
