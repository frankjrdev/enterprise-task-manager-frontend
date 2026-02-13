import { DashboardMetric } from './overview-metrics.mode';

export const OVERVIEW_METRICS_MOCK: readonly DashboardMetric[] = [
  {
    id: 'total-tasks',
    title: 'TOTAL TASKS',
    value: '1,284',
    icon: 'assignment',
    type: 'default',
    trend: {
      direction: 'up',
      value: 12,
      label: 'from last week',
    },
  },
  {
    id: 'active-sprints',
    title: 'ACTIVE SPRINTS',
    value: 12,
    icon: 'flash_on',
    type: 'default',
    trend: {
      direction: 'stable',
      value: 0,
      label: 'Steady state',
    },
  },
  {
    id: 'blocked-issues',
    title: 'BLOCKED ISSUES',
    value: 8,
    icon: 'block',
    type: 'warning',
    trend: {
      direction: 'down',
      value: 5,
      label: 'priority items',
    },
  },
  {
    id: 'team-velocity',
    title: 'TEAM VELOCITY',
    value: '86%',
    icon: 'speed',
    type: 'success',
    trend: {
      direction: 'up',
      value: 2,
      label: 'efficiency',
    },
  },
];
