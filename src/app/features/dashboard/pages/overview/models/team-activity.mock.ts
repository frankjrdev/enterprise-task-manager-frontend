import { TeamActivityItem } from './team-activity.model';

export const TEAM_ACTIVITIES_MOCK: readonly TeamActivityItem[] = [
  {
    id: 'ta-1',
    actorName: 'Sarah Connor',
    actorInitials: 'SC',
    actionType: 'task-moved',
    actionDescription: 'moved',
    targetName: 'UI Component Library',
    targetStatus: 'DONE',
    timestamp: new Date(),
    relativeTime: '2 minutes ago',
  },
  {
    id: 'ta-2',
    actorName: 'John Doe',
    actorInitials: 'JD',
    actionType: 'comment-added',
    actionDescription: 'commented on',
    targetName: 'Security Audit R104',
    comment: 'The encryption keys need rotating before the deployment...',
    timestamp: new Date(),
    relativeTime: '14 minutes ago',
  },
  {
    id: 'ta-3',
    actorName: 'DevOps Bot',
    actorInitials: 'DB',
    actionType: 'alert',
    actionDescription: 'flagged',
    targetName: 'Staging-Server-04',
    targetStatus: 'UNRESPONSIVE',
    timestamp: new Date(),
    relativeTime: '1 hour ago',
    isAlert: true,
  },
];
