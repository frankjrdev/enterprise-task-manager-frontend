import { PriorityTask } from './priority-task.model';

export const PRIORITY_TASKS_MOCK: readonly PriorityTask[] = [
  {
    id: 'pt-1',
    description: 'Core API Architecture Refactor',
    owners: [
      { id: 'u1', name: 'Alex Sterling', initials: 'AS' },
      { id: 'u2', name: 'Maria Lopez', initials: 'ML' },
    ],
    status: 'in-progress',
    priority: 'critical',
    dueDate: new Date('2026-02-16'),
    dueDateLabel: 'Today',
  },
  {
    id: 'pt-2',
    description: 'Infrastructure Auto-scaling Hook',
    owners: [
      { id: 'u3', name: 'James Chen', initials: 'JC' },
      { id: 'u4', name: 'Sarah Connor', initials: 'SC' },
    ],
    status: 'blocked',
    priority: 'high',
    dueDate: new Date('2026-02-14'),
    dueDateLabel: 'Oct 14',
  },
  {
    id: 'pt-3',
    description: 'Mobile Auth Integration Module',
    owners: [
      { id: 'u5', name: 'David Kim', initials: 'DK' },
      { id: 'u1', name: 'Alex Sterling', initials: 'AS' },
    ],
    status: 'done',
    priority: 'medium',
    dueDate: new Date('2026-02-15'),
    dueDateLabel: 'Yesterday',
  },
  {
    id: 'pt-4',
    description: 'Database Latency Monitoring',
    owners: [
      { id: 'u2', name: 'Maria Lopez', initials: 'ML' },
      { id: 'u6', name: 'Tom Reed', initials: 'TR' },
    ],
    status: 'in-progress',
    priority: 'high',
    dueDate: new Date('2026-02-18'),
    dueDateLabel: 'Oct 16',
  },
];
