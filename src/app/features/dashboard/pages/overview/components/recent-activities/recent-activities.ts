import { UpperCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { TeamActivityItem } from '../../models/team-activity.model';

@Component({
  selector: 'recent-activities',
  imports: [UpperCasePipe],
  templateUrl: './recent-activities.html',
  styleUrl: './recent-activities.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecentActivities {
  activities = input.required<readonly TeamActivityItem[]>();
  hasLiveUpdates = input<boolean>(true);

  activityIcon = computed(() => {
    return (type: string): string => {
      const icons: Record<string, string> = {
        'task-moved': 'check_circle',
        'comment-added': 'chat_bubble',
        'status-changed': 'swap_horiz',
        'task-created': 'add_circle',
        'task-assigned': 'person_add',
        alert: 'error',
      };
      return icons[type] ?? 'info';
    };
  });

  activityIconClass = computed(() => {
    return (type: string): string => {
      const classes: Record<string, string> = {
        'task-moved': 'activity-icon--success',
        'comment-added': 'activity-icon--info',
        'status-changed': 'activity-icon--default',
        'task-created': 'activity-icon--success',
        'task-assigned': 'activity-icon--default',
        alert: 'activity-icon--danger',
      };
      return classes[type] ?? 'activity-icon--default';
    };
  });
}
