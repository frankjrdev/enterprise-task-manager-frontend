import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type BadgeStatus = 'in-progress' | 'blocked' | 'done' | 'todo' | 'review';

const STATUS_LABELS: Record<BadgeStatus, string> = {
  'in-progress': 'IN PROGRESS',
  blocked: 'BLOCKED',
  done: 'DONE',
  todo: 'TODO',
  review: 'REVIEW',
};

@Component({
  selector: 'app-status-badge',
  imports: [],
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadge {
  status = input.required<BadgeStatus>();

  label = computed(() => STATUS_LABELS[this.status()] ?? this.status().toUpperCase());
  cssClass = computed(() => `badge--${this.status()}`);
}
