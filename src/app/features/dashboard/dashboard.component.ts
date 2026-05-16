import { Component, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

interface StatCard {
  label: string;
  value: number;
  sub?: string;
  icon: string;
  trend?: number;
  color: string;
}

interface ActivityItem {
  id: string;
  actor: string;
  action: string;
  target: string;
  time: Date;
  type: 'login' | 'access' | 'admin' | 'alert' | 'policy';
}

interface AlertSummaryItem {
  severity: string;
  count: number;
  color: string;
  bg: string;
}

@Component({
  selector: 'asms-dashboard',
  standalone: true,
  imports: [
    DecimalPipe,
    RouterLink,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    PageHeaderComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  readonly stats = signal<StatCard[]>([
    { label: 'Total Users', value: 1_247, sub: '48 added this month', icon: 'people', trend: 4.2, color: '#3b82f6' },
    { label: 'Active Sessions', value: 83, sub: '12 high risk', icon: 'monitor', trend: -6.1, color: '#8b5cf6' },
    { label: 'Events (24h)', value: 5_431, sub: 'Across all orgs', icon: 'timeline', trend: 12.8, color: '#10b981' },
    { label: 'Open Alerts', value: 17, sub: '4 critical', icon: 'notifications_active', trend: 23.5, color: '#ef4444' },
    { label: 'Organizations', value: 34, sub: '3 suspended', icon: 'business', trend: 0, color: '#f59e0b' },
    { label: 'Applications', value: 21, sub: '2 inactive', icon: 'apps', trend: 5.0, color: '#06b6d4' },
  ]);

  readonly alertSummary = signal<AlertSummaryItem[]>([
    { severity: 'Critical', count: 4, color: '#b91c1c', bg: '#fee2e2' },
    { severity: 'High', count: 6, color: '#c2410c', bg: '#ffedd5' },
    { severity: 'Medium', count: 5, color: '#b45309', bg: '#fef3c7' },
    { severity: 'Low', count: 2, color: '#15803d', bg: '#dcfce7' },
  ]);

  readonly recentActivity = signal<ActivityItem[]>([
    { id: '1', actor: 'alice.morgan', action: 'Logged in', target: 'Web Portal', time: new Date(Date.now() - 2 * 60_000), type: 'login' },
    { id: '2', actor: 'bob.chen', action: 'Accessed resource', target: '/api/users', time: new Date(Date.now() - 8 * 60_000), type: 'access' },
    { id: '3', actor: 'admin', action: 'Created user', target: 'carol.smith', time: new Date(Date.now() - 15 * 60_000), type: 'admin' },
    { id: '4', actor: 'SYSTEM', action: 'Brute force detected', target: '203.0.113.5', time: new Date(Date.now() - 23 * 60_000), type: 'alert' },
    { id: '5', actor: 'dana.patel', action: 'Password changed', target: 'Self', time: new Date(Date.now() - 34 * 60_000), type: 'admin' },
    { id: '6', actor: 'admin', action: 'Updated auth policy', target: 'Acme Corp', time: new Date(Date.now() - 47 * 60_000), type: 'policy' },
    { id: '7', actor: 'eve.wilson', action: 'MFA enrolled', target: 'TOTP', time: new Date(Date.now() - 62 * 60_000), type: 'admin' },
    { id: '8', actor: 'SYSTEM', action: 'Session expired', target: 'frank.liu', time: new Date(Date.now() - 75 * 60_000), type: 'login' },
  ]);

  readonly topOrgs = signal([
    { name: 'Acme Corporation', users: 342, sessions: 28, alerts: 3 },
    { name: 'Beta Industries', users: 218, sessions: 19, alerts: 5 },
    { name: 'Gamma Tech', users: 156, sessions: 12, alerts: 1 },
    { name: 'Delta Solutions', users: 134, sessions: 10, alerts: 2 },
    { name: 'Epsilon Group', users: 89, sessions: 7, alerts: 1 },
  ]);

  readonly totalAlerts = computed(() => this.alertSummary().reduce((s, a) => s + a.count, 0));

  activityIcon(type: ActivityItem['type']): string {
    const map: Record<string, string> = {
      login: 'login', access: 'lock_open', admin: 'manage_accounts', alert: 'warning', policy: 'policy'
    };
    return map[type] ?? 'circle';
  }

  activityColor(type: ActivityItem['type']): string {
    const map: Record<string, string> = {
      login: '#3b82f6', access: '#10b981', admin: '#8b5cf6', alert: '#ef4444', policy: '#f59e0b'
    };
    return map[type] ?? '#9ca3af';
  }

  formatRelative(date: Date): string {
    const diff = Math.floor((Date.now() - date.getTime()) / 60_000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ago`;
  }

  trendAbs(v: number): number { return Math.abs(v); }
}
