import { Component, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { SearchInputComponent } from '../../shared/components/search-input/search-input.component';

interface MockActivity {
  id: string;
  actorUsername: string;
  eventType: string;
  category: string;
  targetDisplayName: string;
  status: string;
  ipAddress: string;
  timestamp: Date;
}

const MOCK: MockActivity[] = [
  { id: '1',  actorUsername: 'alice.morgan',   eventType: 'USER_LOGIN',          category: 'AUTH',     targetDisplayName: 'ASMS Web Portal',  status: 'SUCCESS', ipAddress: '192.168.1.15',  timestamp: new Date(Date.now() - 2*60_000)        },
  { id: '2',  actorUsername: 'bob.chen',        eventType: 'RESOURCE_ACCESS',     category: 'ACCESS',   targetDisplayName: '/api/users',        status: 'SUCCESS', ipAddress: '10.0.0.42',     timestamp: new Date(Date.now() - 8*60_000)        },
  { id: '3',  actorUsername: 'admin',           eventType: 'USER_CREATED',        category: 'ADMIN',    targetDisplayName: 'carol.smith',       status: 'SUCCESS', ipAddress: '10.0.0.1',      timestamp: new Date(Date.now() - 15*60_000)       },
  { id: '4',  actorUsername: 'SYSTEM',          eventType: 'BRUTE_FORCE_DETECTED',category: 'SECURITY', targetDisplayName: '203.0.113.5',       status: 'BLOCKED', ipAddress: '203.0.113.5',   timestamp: new Date(Date.now() - 23*60_000)       },
  { id: '5',  actorUsername: 'dana.patel',      eventType: 'PASSWORD_CHANGED',    category: 'AUTH',     targetDisplayName: 'Self',              status: 'SUCCESS', ipAddress: '172.16.0.22',   timestamp: new Date(Date.now() - 34*60_000)       },
  { id: '6',  actorUsername: 'admin',           eventType: 'POLICY_UPDATED',      category: 'ADMIN',    targetDisplayName: 'Acme Auth Policy',  status: 'SUCCESS', ipAddress: '10.0.0.1',      timestamp: new Date(Date.now() - 47*60_000)       },
  { id: '7',  actorUsername: 'eve.wilson',      eventType: 'MFA_ENROLLED',        category: 'AUTH',     targetDisplayName: 'TOTP Device',       status: 'SUCCESS', ipAddress: '192.168.2.55',  timestamp: new Date(Date.now() - 62*60_000)       },
  { id: '8',  actorUsername: 'SYSTEM',          eventType: 'SESSION_EXPIRED',     category: 'SESSION',  targetDisplayName: 'frank.liu',         status: 'INFO',    ipAddress: 'internal',      timestamp: new Date(Date.now() - 75*60_000)       },
  { id: '9',  actorUsername: 'helen.lee',       eventType: 'USER_LOGIN',          category: 'AUTH',     targetDisplayName: 'ASMS Web Portal',   status: 'SUCCESS', ipAddress: '10.1.1.101',    timestamp: new Date(Date.now() - 90*60_000)       },
  { id: '10', actorUsername: 'kevin.brown',     eventType: 'RESOURCE_ACCESS',     category: 'ACCESS',   targetDisplayName: '/api/admin/orgs',   status: 'DENIED',  ipAddress: '192.0.2.88',    timestamp: new Date(Date.now() - 2*3600_000)      },
  { id: '11', actorUsername: 'julia.tang',      eventType: 'USER_LOGIN_FAILED',   category: 'AUTH',     targetDisplayName: 'ASMS Web Portal',   status: 'FAILURE', ipAddress: '203.0.113.99',  timestamp: new Date(Date.now() - 2.1*3600_000)    },
  { id: '12', actorUsername: 'julia.tang',      eventType: 'USER_LOGIN_FAILED',   category: 'AUTH',     targetDisplayName: 'ASMS Web Portal',   status: 'FAILURE', ipAddress: '203.0.113.99',  timestamp: new Date(Date.now() - 2.2*3600_000)    },
  { id: '13', actorUsername: 'julia.tang',      eventType: 'USER_LOGIN_FAILED',   category: 'AUTH',     targetDisplayName: 'ASMS Web Portal',   status: 'FAILURE', ipAddress: '203.0.113.99',  timestamp: new Date(Date.now() - 2.3*3600_000)    },
  { id: '14', actorUsername: 'admin',           eventType: 'USER_LOCKED',         category: 'ADMIN',    targetDisplayName: 'julia.tang',        status: 'SUCCESS', ipAddress: '10.0.0.1',      timestamp: new Date(Date.now() - 2.4*3600_000)    },
  { id: '15', actorUsername: 'mike.taylor',     eventType: 'APP_REGISTERED',      category: 'ADMIN',    targetDisplayName: 'Acme Web Portal',   status: 'SUCCESS', ipAddress: '10.0.1.55',     timestamp: new Date(Date.now() - 5*3600_000)      },
];

const CATEGORY_COLORS: Record<string, string> = {
  AUTH: '#3b82f6', ACCESS: '#10b981', ADMIN: '#8b5cf6', SECURITY: '#ef4444', SESSION: '#f59e0b'
};

const STATUS_COLORS: Record<string, string> = {
  SUCCESS: 'var(--color-success)', FAILURE: 'var(--color-danger)', BLOCKED: 'var(--color-danger)', DENIED: 'var(--color-warning)', INFO: 'var(--color-info)'
};

@Component({
  selector: 'asms-activity-logs',
  standalone: true,
  imports: [
    DatePipe, MatTableModule, MatPaginatorModule, MatButtonModule, MatIconModule, MatCardModule, MatChipsModule, MatSelectModule, MatFormFieldModule,
    PageHeaderComponent, SearchInputComponent,
  ],
  templateUrl: './activity-logs.component.html',
  styleUrl: './activity-logs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityLogsComponent {
  readonly displayedColumns = ['actor', 'eventType', 'category', 'target', 'status', 'ip', 'timestamp'];
  readonly categories = [...new Set(MOCK.map(m => m.category))];
  readonly categoryColors = CATEGORY_COLORS;
  readonly statusColors = STATUS_COLORS;

  readonly searchTerm = signal('');
  readonly categoryFilter = signal('');
  readonly pageIndex = signal(0);
  readonly pageSize = signal(15);
  readonly all = signal<MockActivity[]>(MOCK);

  readonly filtered = computed(() => {
    const q = this.searchTerm().toLowerCase();
    const c = this.categoryFilter();
    return this.all().filter(a =>
      (!q || a.actorUsername.includes(q) || a.eventType.toLowerCase().includes(q)) &&
      (!c || a.category === c)
    );
  });

  readonly paged = computed(() => this.filtered().slice(this.pageIndex() * this.pageSize(), (this.pageIndex() + 1) * this.pageSize()));
  readonly total = computed(() => this.filtered().length);

  onSearch(q: string): void { this.searchTerm.set(q); this.pageIndex.set(0); }
  onCategoryFilter(c: string): void { this.categoryFilter.set(c); this.pageIndex.set(0); }
  onPage(e: PageEvent): void { this.pageIndex.set(e.pageIndex); this.pageSize.set(e.pageSize); }

  categoryColor(cat: string): string { return CATEGORY_COLORS[cat] ?? '#6b7280'; }
  statusColor(st: string): string { return STATUS_COLORS[st] ?? 'var(--color-neutral)'; }

  eventIcon(eventType: string): string {
    if (eventType.includes('LOGIN')) return 'login';
    if (eventType.includes('CREATED') || eventType.includes('REGISTERED')) return 'add_circle';
    if (eventType.includes('DELETED') || eventType.includes('LOCKED')) return 'block';
    if (eventType.includes('POLICY')) return 'policy';
    if (eventType.includes('MFA')) return 'verified_user';
    if (eventType.includes('SESSION')) return 'timer';
    if (eventType.includes('BRUTE')) return 'warning';
    return 'circle';
  }
}
