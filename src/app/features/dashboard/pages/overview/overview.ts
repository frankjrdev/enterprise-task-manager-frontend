import { Component } from '@angular/core';
import { GlobalProgress } from './components/global-progress/global-progress';
import { MetricsCards } from './components/metrics-cards/metrics-cards';
import { PriorityTasks } from './components/priority-tasks/priority-tasks';
import { RecentActivities } from './components/recent-activities/recent-activities';
import { TimeFilter } from './components/time-filter/time-filter';
import {
  DashboardMetric,
  OVERVIEW_METRICS_MOCK,
  PriorityTask,
  PRIORITY_TASKS_MOCK,
  TeamActivityItem,
  TEAM_ACTIVITIES_MOCK,
} from './models';

@Component({
  selector: 'app-overview',
  imports: [MetricsCards, GlobalProgress, RecentActivities, PriorityTasks, TimeFilter],
  templateUrl: './overview.html',
  styleUrl: './overview.scss',
})
export class Overview {
  readonly metricsCards: readonly DashboardMetric[] = OVERVIEW_METRICS_MOCK;
  readonly priorityTasks: readonly PriorityTask[] = PRIORITY_TASKS_MOCK;
  readonly teamActivities: readonly TeamActivityItem[] = TEAM_ACTIVITIES_MOCK;
}
