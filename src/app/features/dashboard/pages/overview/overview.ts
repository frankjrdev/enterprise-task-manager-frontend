import { Component } from '@angular/core';
import { GlobalProgress } from './components/global-progress/global-progress';
import { MetricsCards } from './components/metrics-cards/metrics-cards';
import { DashboardMetric, OVERVIEW_METRICS_MOCK } from './models';

@Component({
  selector: 'app-overview',
  imports: [GlobalProgress, MetricsCards],
  templateUrl: './overview.html',
  styleUrl: './overview.scss',
})
export class Overview {
  readonly metricsCards: readonly DashboardMetric[] = OVERVIEW_METRICS_MOCK;
}
