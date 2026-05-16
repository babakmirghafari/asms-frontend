import { Component, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusChipComponent } from '../../shared/components/status-chip/status-chip.component';
import { SearchInputComponent } from '../../shared/components/search-input/search-input.component';

interface MockSession {
  id: string;
  username: string;
  displayName: string;
  organizationName: string;
  status: string;
  ipAddress: string;
  userAgent: string;
  riskScore: number;
  createdAt: Date;
  lastActivityAt: Date;
  location: string;
}

const MOCK: MockSession[] = [
  { id: '1',  username: 'alice.morgan',  displayName: 'Alice Morgan',  organizationName: 'Acme Corporation', status: 'ACTIVE',  ipAddress: '192.168.1.15',  userAgent: 'Chrome 124 / macOS', riskScore: 8,  createdAt: new Date(Date.now() - 2*3600_000),  lastActivityAt: new Date(Date.now() - 2*60_000),  location: 'London, UK'     },
  { id: '2',  username: 'bob.chen',      displayName: 'Bob Chen',      organizationName: 'Acme Corporation', status: 'ACTIVE',  ipAddress: '10.0.0.42',     userAgent: 'Firefox 125 / Win11',riskScore: 12, createdAt: new Date(Date.now() - 5*3600_000),  lastActivityAt: new Date(Date.now() - 8*60_000),  location: 'New York, US'   },
  { id: '3',  username: 'dana.patel',    displayName: 'Dana Patel',    organizationName: 'Acme Corporation', status: 'ACTIVE',  ipAddress: '203.0.113.5',   userAgent: 'Safari 17 / iOS',   riskScore: 45, createdAt: new Date(Date.now() - 1*3600_000),  lastActivityAt: new Date(Date.now() - 30_000),    location: 'Mumbai, IN'     },
  { id: '4',  username: 'evan.jones',    displayName: 'Evan Jones',    organizationName: 'Gamma Tech',       status: 'ACTIVE',  ipAddress: '172.16.0.8',    userAgent: 'Edge 123 / Win10',  riskScore: 5,  createdAt: new Date(Date.now() - 30*60_000),   lastActivityAt: new Date(Date.now() - 5*60_000),  location: 'Berlin, DE'     },
  { id: '5',  username: 'fiona.wright',  displayName: 'Fiona Wright',  organizationName: 'Delta Solutions',  status: 'ACTIVE',  ipAddress: '198.51.100.23', userAgent: 'Chrome 124 / Linux', riskScore: 22, createdAt: new Date(Date.now() - 4*3600_000),  lastActivityAt: new Date(Date.now() - 15*60_000), location: 'Toronto, CA'    },
  { id: '6',  username: 'helen.lee',     displayName: 'Helen Lee',     organizationName: 'Acme Corporation', status: 'ACTIVE',  ipAddress: '10.1.1.101',    userAgent: 'Chrome 124 / macOS', riskScore: 3,  createdAt: new Date(Date.now() - 45*60_000),   lastActivityAt: new Date(Date.now() - 3*60_000),  location: 'London, UK'     },
  { id: '7',  username: 'kevin.brown',   displayName: 'Kevin Brown',   organizationName: 'Delta Solutions',  status: 'ACTIVE',  ipAddress: '192.0.2.88',    userAgent: 'Firefox 125 / macOS',riskScore: 67, createdAt: new Date(Date.now() - 15*60_000),   lastActivityAt: new Date(Date.now() - 1*60_000),  location: 'Sydney, AU'     },
  { id: '8',  username: 'mike.taylor',   displayName: 'Mike Taylor',   organizationName: 'Beta Industries',  status: 'ACTIVE',  ipAddress: '10.0.1.55',     userAgent: 'Chrome 124 / Win11', riskScore: 9,  createdAt: new Date(Date.now() - 6*3600_000),  lastActivityAt: new Date(Date.now() - 20*60_000), location: 'Chicago, US'    },
  { id: '9',  username: 'julia.tang',    displayName: 'Julia Tang',    organizationName: 'Gamma Tech',       status: 'REVOKED', ipAddress: '203.0.113.99',  userAgent: 'Unknown browser',   riskScore: 95, createdAt: new Date(Date.now() - 3*3600_000),  lastActivityAt: new Date(Date.now() - 2*3600_000),location: 'Unknown'        },
  { id: '10', username: 'oliver.garcia', displayName: 'Oliver Garcia', organizationName: 'Gamma Tech',       status: 'ACTIVE',  ipAddress: '172.20.0.15',   userAgent: 'Chrome 124 / macOS', riskScore: 14, createdAt: new Date(Date.now() - 90*60_000),   lastActivityAt: new Date(Date.now() - 10*60_000), location: 'Madrid, ES'     },
];

const STATUS_MAP: Record<string, 'success' | 'danger' | 'neutral'> = { ACTIVE: 'success', REVOKED: 'danger', EXPIRED: 'neutral' };

@Component({
  selector: 'asms-sessions',
  standalone: true,
  imports: [
    DatePipe, MatTableModule, MatPaginatorModule, MatButtonModule, MatIconModule, MatMenuModule, MatCardModule, MatTooltipModule, MatSelectModule, MatFormFieldModule,
    PageHeaderComponent, StatusChipComponent, SearchInputComponent,
  ],
  templateUrl: './sessions.component.html',
  styleUrl: './sessions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionsComponent {
  readonly displayedColumns = ['user', 'organization', 'ip', 'status', 'riskScore', 'lastActivity', 'actions'];
  readonly statusMap = STATUS_MAP;

  readonly searchTerm = signal('');
  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);
  readonly all = signal<MockSession[]>(MOCK);

  readonly activeCount = computed(() => this.all().filter(s => s.status === 'ACTIVE').length);
  readonly highRiskCount = computed(() => this.all().filter(s => s.riskScore >= 50 && s.status === 'ACTIVE').length);

  readonly filtered = computed(() => {
    const q = this.searchTerm().toLowerCase();
    return this.all().filter(s => !q || s.username.includes(q) || s.ipAddress.includes(q));
  });

  readonly paged = computed(() => this.filtered().slice(this.pageIndex() * this.pageSize(), (this.pageIndex() + 1) * this.pageSize()));
  readonly total = computed(() => this.filtered().length);

  onSearch(q: string): void { this.searchTerm.set(q); this.pageIndex.set(0); }
  onPage(e: PageEvent): void { this.pageIndex.set(e.pageIndex); this.pageSize.set(e.pageSize); }

  revokeSession(s: MockSession): void {
    this.all.update(list => list.map(i => i.id === s.id ? { ...i, status: 'REVOKED' } : i));
  }

  riskColor(score: number): string {
    if (score >= 70) return '#ef4444';
    if (score >= 40) return '#f59e0b';
    return '#10b981';
  }

  riskLabel(score: number): string {
    if (score >= 70) return 'High';
    if (score >= 40) return 'Medium';
    return 'Low';
  }
}
