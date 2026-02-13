// Priority Task Model

/**
 * Posible states of a priority task
 */
export type PriorityTaskStatus = 'in-progress' | 'blocked' | 'done' | 'todo' | 'review';

/**
 * Priority of a task
 */
export type TaskPriority = 'high' | 'medium' | 'low' | 'critical';

/**
 * Owner/Assignee of a task
 */
export interface TaskOwner {
  readonly id: string;
  readonly name: string;
  readonly avatarUrl?: string;
  readonly initials: string;
}

/**
 * Priority task from the dashboard
 *
 * @example
 * const task: PriorityTask = {
 *   id: '1',
 *   description: 'Core API Architecture Refactor',
 *   owners: [{ id: '1', name: 'John Doe', initials: 'JD' }],
 *   status: 'in-progress',
 *   priority: 'high',
 *   dueDate: new Date('2026-02-09'),
 *   dueDateLabel: 'Today'
 * };
 */
export interface PriorityTask {
  readonly id: string;
  readonly description: string;
  readonly owners: readonly TaskOwner[];
  readonly status: PriorityTaskStatus;
  readonly priority: TaskPriority;
  readonly dueDate: Date;
  readonly dueDateLabel: string;
}

/**
 * Paginated response of priority tasks
 */
export interface PriorityTasksResponse {
  readonly tasks: readonly PriorityTask[];
  readonly total: number;
  readonly hasMore: boolean;
}
