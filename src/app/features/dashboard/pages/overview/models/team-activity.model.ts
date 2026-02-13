/**
 * Types of team activity
 */
export type ActivityType =
  | 'task-moved'
  | 'comment-added'
  | 'status-changed'
  | 'task-created'
  | 'task-assigned'
  | 'alert';

/**
 * Team activity item element
 *
 * @example
 * const activity: TeamActivityItem = {
 *   id: '1',
 *   actorName: 'Sarah Connor',
 *   actorAvatarUrl: '/avatars/sarah.jpg',
 *   actionType: 'task-moved',
 *   actionDescription: 'moved UI Component Library to',
 *   targetStatus: 'done',
 *   targetName: 'UI Component Library',
 *   timestamp: new Date(),
 *   relativeTime: '2 minutes ago'
 * };
 */
export interface TeamActivityItem {
  readonly id: string;
  readonly actorName: string;
  readonly actorAvatarUrl?: string;
  readonly actorInitials?: string;
  readonly actionType: ActivityType;
  readonly actionDescription: string;
  readonly targetName?: string;
  readonly targetStatus?: string;
  readonly comment?: string;
  readonly timestamp: Date;
  readonly relativeTime: string;
  readonly isAlert?: boolean;
}

/**
 * Team activities response
 */
export interface TeamActivityResponse {
  readonly activities: readonly TeamActivityItem[];
  readonly hasLiveUpdates: boolean;
  readonly lastUpdated: Date;
}
