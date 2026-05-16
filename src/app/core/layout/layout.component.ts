import { Component, inject, signal, computed } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { AuthStore } from '../store/auth.store';

interface NavItem {
  label: string; icon: string; route: string;
  group?: string; badge?: number; badgeRed?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',         icon: 'dashboard',            route: '/dashboard',         group: 'Overview' },
  { label: 'Settings',          icon: 'settings',             route: '/settings',          group: 'Overview' },
  { label: 'Users',             icon: 'people',               route: '/users',             group: 'Identity',  badge: 10 },
  { label: 'Organizations',     icon: 'business',             route: '/organizations',     group: 'Identity',  badge: 5 },
  { label: 'Memberships',       icon: 'group_add',            route: '/memberships',       group: 'Identity' },
  { label: 'Applications',      icon: 'apps',                 route: '/applications',      group: 'Identity',  badge: 4 },
  { label: 'Permission Groups', icon: 'folder_shared',        route: '/permission-groups', group: 'Access',    badge: 8 },
  { label: 'Permissions',       icon: 'key',                  route: '/permissions',       group: 'Access' },
  { label: 'Access Control',    icon: 'admin_panel_settings', route: '/access-control',    group: 'Access' },
  { label: 'Auth Policies',     icon: 'policy',               route: '/auth-policies',     group: 'Policies' },
  { label: 'Station Policies',  icon: 'location_on',          route: '/station-policies',  group: 'Policies' },
  { label: 'Sessions',          icon: 'monitor',              route: '/sessions',          group: 'Monitoring', badge: 2, badgeRed: true },
  { label: 'Activity Logs',     icon: 'history',              route: '/activity-logs',     group: 'Monitoring' },
  { label: 'Audit & Compliance',icon: 'fact_check',           route: '/audit-logs',        group: 'Monitoring' },
  { label: 'Alerts',            icon: 'notifications_active', route: '/alerts',            group: 'Monitoring', badge: 4, badgeRed: true },
];

@Component({
  selector: 'asms-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatTooltipModule,
    MatDividerModule,
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
})
export class LayoutComponent {
  private authStore = inject(AuthStore);
  private router    = inject(Router);

  sidebarCollapsed = signal(false);
  navItems = NAV_ITEMS;

  groups = computed(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const item of this.navItems) {
      if (item.group && !seen.has(item.group)) {
        seen.add(item.group);
        result.push(item.group);
      }
    }
    return result;
  });

  itemsByGroup(group: string): NavItem[] {
    return this.navItems.filter(i => i.group === group);
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  logout(): void {
    this.authStore.clearToken();
    this.router.navigate(['/auth/login']);
  }
}
