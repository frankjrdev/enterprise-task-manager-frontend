import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ProgressRing } from '@shared/ui/progress-ring/progress-ring';

@Component({
  selector: 'global-progress',
  imports: [ProgressRing],
  templateUrl: './global-progress.html',
  styleUrl: './global-progress.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GlobalProgress {
  totalTasks = input.required<number>();
  completedTasks = input.required<number>();
  onTrack = input<number>(842);
  atRisk = input<number>(24);

  unCompletedTasks = computed(() => {
    const unCompleted = this.totalTasks() - this.completedTasks();
    return unCompleted > 0 ? unCompleted : 0;
  });

  percentage = computed(() => {
    if (this.totalTasks() === 0) {
      return 0;
    }
    return Math.round((this.completedTasks() / this.totalTasks()) * 100);
  });
}
