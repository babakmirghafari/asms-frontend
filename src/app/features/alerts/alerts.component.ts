import { Component, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusChipComponent } from '../../shared/components/status-chip/status-chip.component';
import { SearchInputComponent } from '../../shared/components/search-input/search-input.component';

interface MockAlert {
  id: string;
  alertType: string;
  severity: string;
  status: string;
  actorUsername: string;
  riskScore: number;
  description: string;
  affectedResource: string;
  createdAt: Date;
}

const MOCK: MockAlert[] = [
  { id: '1',  alertType: 'BRUTE_FORCE',            severity: 'CRITICAL', status: 'OPEN',         actorUsername: 'julia.tang',     riskScore: 95, description: '15 failed login attempts in 5 minutes',       affectedResource: '/auth/login',      createdAt: new Date(Date.now() - 23*60_000)       },
  { id: '2',  alertType: 'ANOMALOUS_LOGIN',         severity: 'HIGH',     status: 'OPEN',         actorUsername: 'kevin.brown',    riskScore: 78, description: 'Login from unusual geographic location',        affectedResource: 'ASMS Web Portal',  createdAt: new Date(Date.now() - 45*60_000)       },
  { id: '3',  alertType: 'PRIVILEGE_ESCALATION',    severity: 'CRITICAL', status: 'ACKNOWLEDGED', actorUsername: 'evan.jones',     riskScore: 88, description: 'User attempted to access admin endpoint',      affectedResource: '/api/admin',       createdAt: new Date(Date.now() - 1.5*3600_000)   },
  { id: '4',  alertType: 'DATA_EXFILTRATION',       severity: 'HIGH',     status: 'OPEN',         actorUsername: 'unknown',        riskScore: 82, description: 'Large data download detected',                 affectedResource: '/api/exports',     createdAt: new Date(Date.now() - 2*3600_000)     },
  { id: '5',  alertType: 'ACCOUNT_LOCKOUT',         severity: 'MEDIUM',   status: 'RESOLVED',     actorUsername: 'nina.wilson',    riskScore: 35, description: 'Account locked due to failed MFA attempts',    affectedResource: 'User Account',     createdAt: new Date(Date.now() - 3*3600_000)     },
  { id: '6',  alertType: 'SUSPICIOUS_IP',           severity: 'HIGH',     status: 'OPEN',         actorUsername: 'dana.patel',     riskScore: 65, description: 'Login from Tor exit node detected',            affectedResource: '/auth/token',      createdAt: new Date(Date.now() - 4*3600_000)     },
  { id: '7',  alertType: 'MFA_BYPASS_ATTEMPT',      severity: 'CRITICAL', status: 'OPEN',         actorUsername: 'george.kim',     riskScore: 91, description: 'MFA verification bypassed via legacy endpoint', affectedResource: '/auth/mfa/bypass', createdAt: new Date(Date.now() - 5*3600_000)     },
  { id: '8',  alertType: 'SESSION_HIJACKING',       severity: 'HIGH',     status: 'ACKNOWLEDGED', actorUsername: 'SYSTEM',         riskScore: 73, description: 'Session token used from different IP',          affectedResource: 'Session ses-042', createdAt: new Date(Date.now() - 6*3600_000)     },
  { id: '9',  alertType: 'POLICY_VIOLATION',        severity: 'MEDIUM',   status: 'OPEN',         actorUsername: 'carol.smith',    riskScore: 40, description: 'Access outside permitted station hours',        affectedResource: 'Station Policy',   createdAt: new Date(Date.now() - 8*3600_000)     },
  { id: '10', alertType: 'TOKEN_ANOMALY',           severity: 'LOW',      status: 'RESOLVED',     actorUsername: 'helen.lee',      riskScore: 15, description: 'JWT issued with unusual claim set',             affectedResource: '/auth/token',      createdAt: new Date(Date.now() - 10*3600_000)    },
  { id: '11', alertType: 'RATE_LIMIT_EXCEEDED',     severity: 'MEDIUM',   status: 'SUPPRESSED',   actorUsername: 'beta-erp-app',   riskScore: 30, description: 'API rate limit exceeded by integration client', affectedResource: '/api/v1',          createdAt: new Date(Date.now() - 12*3600_000)    },
  { id: '12', alertType: 'CERT_EXPIRY',             severity: 'LOW',      status: 'OPEN',         actorUsername: 'SYSTEM',         riskScore: 10, description: 'TLS certificate expires in 7 days',             affectedResource: 'api.asms.io',      createdAt: new Date(Date.now() - 24*3600_000)    },
];

const SEV_MAP: Record<string, 'success' | 'warning' | 'danger' | 'critical'> = { LOW: 'success', MEDIUM: 'warning', HIGH: 'danger', CRITICAL: 'critical' };
const STATUS_MAP: Record<string, 'danger' | 'warning' | 'success' | 'neutral'> = { OPEN: 'danger', ACKNOWLEDGED: 'warning', RESOLVED: 'success', SUPPRESSED: 'neutral' };

@Component({
  selector: 'asms-alerts',
  standalone: true,
  imports: [
    DatePipe, MatTableModule, MatPaginatorModule, MatButtonModule, MatIconModule, MatMenuModule, MatCardModule, MatSelectModule, MatFormFieldModule, MatTooltipModule,
    PageHeaderComponent, StatusChipComponent, SearchInputComponent,
  ],
  templateUrl: './alerts.component.html',
  styleUrl: './alerts.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertsComponent {
  readonly displayedColumns = ['severity', 'alertType', 'description', 'actorUsername', 'riskScore', 'status', 'createdAt', 'actions'];
  readonly sevMap = SEV_MAP;
  readonly statusMap = STATUS_MAP;
  readonly severities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  readonly statuses = ['OPEN', 'ACKNOWLEDGED', 'RESOLVED', 'SUPPRESSED'];

  readonly searchTerm = signal('');
  readonly severityFilter = signal('');
  readonly statusFilter = signal('');
  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);
  readonly all = signal<MockAlert[]>(MOCK);

  readonly openCount = computed(() => this.all().filter(a => a.status === 'OPEN').length);
  readonly criticalCount = computed(() => this.all().filter(a => a.severity === 'CRITICAL' && a.status === 'OPEN').length);

  readonly filtered = computed(() => {
    const q = this.searchTerm().toLowerCase();
    const sev = this.severityFilter();
    const st = this.statusFilter();
    return this.all().filter(a =>
      (!q || a.alertType.toLowerCase().includes(q) || a.actorUsername.includes(q)) &&
      (!sev || a.severity === sev) &&
      (!st || a.status === st)
    );
  });

  readonly paged = computed(() => this.filtered().slice(this.pageIndex() * this.pageSize(), (this.pageIndex() + 1) * this.pageSize()));
  readonly total = computed(() => this.filtered().length);

  onSearch(q: string): void { this.searchTerm.set(q); this.pageIndex.set(0); }
  onSeverityFilter(s: string): void { this.severityFilter.set(s); this.pageIndex.set(0); }
  onStatusFilter(s: string): void { this.statusFilter.set(s); this.pageIndex.set(0); }
  onPage(e: PageEvent): void { this.pageIndex.set(e.pageIndex); this.pageSize.set(e.pageSize); }

  acknowledge(a: MockAlert): void {
    this.all.update(list => list.map(i => i.id === a.id ? { ...i, status: 'ACKNOWLEDGED' } : i));
  }

  resolve(a: MockAlert): void {
    this.all.update(list => list.map(i => i.id === a.id ? { ...i, status: 'RESOLVED' } : i));
  }

  dismiss(a: MockAlert): void {
    this.all.update(list => list.map(i => i.id === a.id ? { ...i, status: 'SUPPRESSED' } : i));
  }

  sevColor(sev: string): string {
    return { CRITICAL: '#b91c1c', HIGH: '#c2410c', MEDIUM: '#b45309', LOW: '#15803d' }[sev] ?? '#6b7280';
  }

  sevBg(sev: string): string {
    return { CRITICAL: '#fee2e2', HIGH: '#ffedd5', MEDIUM: '#fef3c7', LOW: '#dcfce7' }[sev] ?? '#f3f4f6';
  }
}
