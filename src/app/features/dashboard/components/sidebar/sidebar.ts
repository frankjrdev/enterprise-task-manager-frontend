import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { id } from '@swimlane/ngx-charts';

@Component({
  selector: 'sidebar',
  imports: [RouterLink, RouterLinkActive, MatSidenavModule, MatListModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class SidebarComponent {
  userNavigateOptions: any[] = [
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

  configNavigateOptions: any[] = [
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
