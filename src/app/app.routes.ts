import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('@layouts/main-layout/main-layout').then((m) => m.MainLayout),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadChildren: () =>
          import('@features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('@features/setting/settings.routes').then((m) => m.SETTINGS_ROUTES),
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('@features/profile/profile.routes').then((m) => m.PROFILE_ROUTES),
      },
    ],
  },
  {
    path: 'auth',
    loadComponent: () => import('@layouts/auth-layout/auth-layout').then((m) => m.AuthLayout),
    loadChildren: () => import('@features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  { path: '**', redirectTo: 'dashboard' },
];
