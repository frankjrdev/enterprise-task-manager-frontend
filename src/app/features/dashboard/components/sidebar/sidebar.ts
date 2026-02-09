import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';

interface NavigationOption {
  id: string;
  path: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, MatSidenavModule, MatListModule, MatIconModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class SidebarComponent {
  userNavigateOptions: NavigationOption[] = [
    {
      id: 'overview',
      path: '/dashboard',
      label: 'Overview',
      icon: 'dashboard',
    },
    {
      id: 'projects',
      path: '/dashboard/projects',
      label: 'Projects',
      icon: 'folder',
    },
    {
      id: 'tasks',
      path: '/dashboard/tasks',
      label: 'Tasks',
      icon: 'task',
    },
    {
      id: 'analytics',
      path: '/dashboard/analytics',
      label: 'Analytics',
      icon: 'analytics',
    },
  ];

  configNavigateOptions: NavigationOption[] = [
    {
      id: 'settings',
      path: '/dashboard/settings',
      label: 'Settings',
      icon: 'settings',
    },
    {
      id: 'profile',
      path: '/dashboard/profile',
      label: 'Profile',
      icon: 'person',
    },
    {
      id: 'help',
      path: '/dashboard/help',
      label: 'Help',
      icon: 'help',
    },
  ];
}
