import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'progress-ring',
  imports: [],
  templateUrl: './progress-ring.html',
  styleUrl: './progress-ring.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressRing {
  percentage = input.required<number>();
  size = input<number>(200);
  strokeWidth = input<number>(14);
  trackColor = input<string>('#36383d');
  progressColor = input<string>('#e29a33');

  radius = computed(() => (this.size() - this.strokeWidth()) / 2);
  circumference = computed(() => 2 * Math.PI * this.radius());
  center = computed(() => this.size() / 2);

  strokeDashoffset = computed(() => {
    const clampedPercentage = Math.max(0, Math.min(100, this.percentage()));
    return this.circumference() * (1 - clampedPercentage / 100);
  });
}
