import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';

interface NavigationOption {
  id: string;
  path: string;
  label: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, MatSidenavModule, MatListModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class SidebarComponent {
  userNavigateOptions: NavigationOption[] = [
    {
      id: 'overview',
      path: '/dashboard',
      label: 'Overview',
    },
    {
      id: 'projects',
      path: '/dashboard/projects',
      label: 'Projects',
    },
    {
      id: 'tasks',
      path: '/dashboard/tasks',
      label: 'Tasks',
    },
    {
      id: 'analytics',
      path: '/dashboard/analytics',
      label: 'Analytics',
    },
  ];

  configNavigateOptions: NavigationOption[] = [
    {
      id: 'settings',
      path: '/dashboard/settings',
      label: 'Settings',
    },
    {
      id: 'profile',
      path: '/dashboard/profile',
      label: 'Profile',
    },
    {
      id: 'help',
      path: '/dashboard/help',
      label: 'Help',
    },
  ];
}
