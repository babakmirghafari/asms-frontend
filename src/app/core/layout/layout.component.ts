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
  label: string;
  icon: string;
  route: string;
  group?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',         icon: 'dashboard',          route: '/dashboard',          group: 'Overview' },
  { label: 'Users',             icon: 'people',             route: '/users',              group: 'Identity' },
  { label: 'Organizations',     icon: 'business',           route: '/organizations',      group: 'Identity' },
  { label: 'Memberships',       icon: 'group_add',          route: '/memberships',        group: 'Identity' },
  { label: 'Permission Groups', icon: 'folder_shared',      route: '/permission-groups',  group: 'Access Control' },
  { label: 'Permissions',       icon: 'security',           route: '/permissions',        group: 'Access Control' },
  { label: 'Access Control',    icon: 'admin_panel_settings', route: '/access-control',   group: 'Access Control' },
  { label: 'Applications',      icon: 'apps',               route: '/applications',       group: 'Integration' },
  { label: 'Auth Policies',     icon: 'policy',             route: '/auth-policies',      group: 'Policy' },
  { label: 'Station Policies',  icon: 'location_on',        route: '/station-policies',   group: 'Policy' },
  { label: 'Sessions',          icon: 'devices',            route: '/sessions',           group: 'Monitoring' },
  { label: 'Activity Logs',     icon: 'history',            route: '/activity-logs',      group: 'Monitoring' },
  { label: 'Audit Logs',        icon: 'fact_check',         route: '/audit-logs',         group: 'Compliance' },
  { label: 'Alerts',            icon: 'notifications_active', route: '/alerts',           group: 'Compliance' },
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
