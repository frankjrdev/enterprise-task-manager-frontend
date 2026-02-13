import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MetricTrend } from '../../models';

@Component({
  selector: 'metrics-cards',
  imports: [],
  templateUrl: './metrics-cards.html',
  styleUrl: './metrics-cards.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricsCards {
  title = input.required<string>();
  value = input.required<string | number>();

  subtitle = input<string>('');
  trend = input<MetricTrend | undefined>(undefined);
  icon = input<string>('');
  iconLabel = input<string>('');

  trendPrefix = computed(() => {
    const direction = this.trend()?.direction;
    return direction === 'up' ? '+' : direction === 'down' ? '-' : '';
  });

  trendCss = computed(() => this.trend()?.direction ?? 'stable');

  trendLabel = computed(() => {
    const currentTrend = this.trend();

    if (!currentTrend) {
      return '';
    }

    if (currentTrend.direction === 'stable') {
      return '—';
    }

    return `${this.trendPrefix()}${currentTrend.value}%`;
  });
}
