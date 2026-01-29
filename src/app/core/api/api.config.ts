import { environment } from './environment';

export const API_ENDPOINTS = {
  tasks: {
    base: `${environment.apiUrl}/tasks`,
    byId: (id: string) => `${environment.apiUrl}/tasks/${id}`,
    priority: `${environment.apiUrl}/tasks/priority`,
    stats: `${environment.apiUrl}/tasks/stats`,
  },
  dashboard: {
    overview: `${environment.apiUrl}/dashboard/overview`,
    activities: `${environment.apiUrl}/dashboard/activities`,
  },
  users: {
    me: `${environment.apiUrl}/users/me`,
    byId: (id: string) => `${environment.apiUrl}/users/${id}`,
    settings: `${environment.apiUrl}/users/settings`,
    team: `${environment.apiUrl}/users/team`,
  },
};
