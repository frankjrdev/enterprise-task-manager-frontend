import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';
import { MetricsTimeFilter } from '../../models';

export interface TimeFilterOption {
  readonly value: MetricsTimeFilter;
  readonly label: string;
}

const DEFAULT_OPTIONS: readonly TimeFilterOption[] = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
];

@Component({
  selector: 'time-filter',
  imports: [],
  templateUrl: './time-filter.html',
  styleUrl: './time-filter.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TimeFilter {
  options = input<readonly TimeFilterOption[]>(DEFAULT_OPTIONS);
  selected = model<MetricsTimeFilter>('7d');

  selectFilter(value: MetricsTimeFilter): void {
    this.selected.set(value);
  }
}
