import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PriorityTask } from '../../models/priority-task.model';
import { StatusBadge } from '@shared/ui/status-badge/status-badge';

@Component({
  selector: 'priority-tasks',
  imports: [StatusBadge],
  templateUrl: './priority-tasks.html',
  styleUrl: './priority-tasks.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PriorityTasks {
  tasks = input.required<readonly PriorityTask[]>();

  getPriorityColor(priority: string): string {
    const colors: Record<string, string> = {
      critical: '#ef4444',
      high: '#e29a33',
      medium: '#3b82f6',
      low: '#10b981',
    };
    return colors[priority] ?? '#9da0a8';
  }
}
