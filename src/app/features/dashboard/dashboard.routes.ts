import { Routes } from '@angular/router';

export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/overview/overview').then((m) => m.OverviewComponent),
  },
  // {
  //   path: 'analytics',
  //   loadComponent: () => import('./pages/analytics/analytics').then((m) => m.Analytics),
  // },
];
