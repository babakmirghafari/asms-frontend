import { Component, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusChipComponent } from '../../shared/components/status-chip/status-chip.component';
import { SearchInputComponent } from '../../shared/components/search-input/search-input.component';

interface MockAuditEntry {
  id: string;
  actorUsername: string;
  eventType: string;
  targetType: string;
  targetId: string;
  outcome: string;
  ipAddress: string;
  requestId: string;
  timestamp: Date;
}

const MOCK: MockAuditEntry[] = [
  { id: '1',  actorUsername: 'alice.morgan',   eventType: 'USER_LOGIN',           targetType: 'SESSION',      targetId: 'ses-001', outcome: 'SUCCESS', ipAddress: '192.168.1.15',  requestId: 'req-a1b2c3', timestamp: new Date(Date.now() - 2*60_000)       },
  { id: '2',  actorUsername: 'admin',           eventType: 'USER_CREATED',         targetType: 'USER',         targetId: 'usr-042', outcome: 'SUCCESS', ipAddress: '10.0.0.1',      requestId: 'req-d4e5f6', timestamp: new Date(Date.now() - 15*60_000)      },
  { id: '3',  actorUsername: 'SYSTEM',          eventType: 'ALERT_TRIGGERED',      targetType: 'ALERT',        targetId: 'alt-007', outcome: 'SUCCESS', ipAddress: 'internal',      requestId: 'req-g7h8i9', timestamp: new Date(Date.now() - 23*60_000)      },
  { id: '4',  actorUsername: 'admin',           eventType: 'POLICY_UPDATED',       targetType: 'AUTH_POLICY',  targetId: 'pol-001', outcome: 'SUCCESS', ipAddress: '10.0.0.1',      requestId: 'req-j0k1l2', timestamp: new Date(Date.now() - 47*60_000)      },
  { id: '5',  actorUsername: 'kevin.brown',     eventType: 'RESOURCE_ACCESS',      targetType: 'API_ENDPOINT', targetId: '/api/admin', outcome: 'FAILURE', ipAddress: '192.0.2.88', requestId: 'req-m3n4o5', timestamp: new Date(Date.now() - 2*3600_000)    },
  { id: '6',  actorUsername: 'admin',           eventType: 'USER_DELETED',         targetType: 'USER',         targetId: 'usr-089', outcome: 'SUCCESS', ipAddress: '10.0.0.1',      requestId: 'req-p6q7r8', timestamp: new Date(Date.now() - 3*3600_000)    },
  { id: '7',  actorUsername: 'dana.patel',      eventType: 'PERMISSION_GRANTED',   targetType: 'PERMISSION',   targetId: 'perm-022',outcome: 'SUCCESS', ipAddress: '172.16.0.22',  requestId: 'req-s9t0u1', timestamp: new Date(Date.now() - 5*3600_000)    },
  { id: '8',  actorUsername: 'SYSTEM',          eventType: 'SESSION_REVOKED',      targetType: 'SESSION',      targetId: 'ses-099', outcome: 'SUCCESS', ipAddress: 'internal',      requestId: 'req-v2w3x4', timestamp: new Date(Date.now() - 6*3600_000)    },
  { id: '9',  actorUsername: 'fiona.wright',    eventType: 'ORG_CREATED',          targetType: 'ORGANIZATION', targetId: 'org-012', outcome: 'SUCCESS', ipAddress: '198.51.100.23', requestId: 'req-y5z6a7', timestamp: new Date(Date.now() - 8*3600_000)   },
  { id: '10', actorUsername: 'admin',           eventType: 'ROLE_ASSIGNED',        targetType: 'MEMBERSHIP',   targetId: 'mem-055', outcome: 'SUCCESS', ipAddress: '10.0.0.1',      requestId: 'req-b8c9d0', timestamp: new Date(Date.now() - 12*3600_000)   },
  { id: '11', actorUsername: 'SYSTEM',          eventType: 'AUDIT_EXPORT',         targetType: 'AUDIT_LOG',    targetId: 'exp-001', outcome: 'SUCCESS', ipAddress: 'internal',      requestId: 'req-e1f2g3', timestamp: new Date(Date.now() - 24*3600_000)   },
  { id: '12', actorUsername: 'oliver.garcia',   eventType: 'USER_LOGIN',           targetType: 'SESSION',      targetId: 'ses-212', outcome: 'PARTIAL', ipAddress: '172.20.0.15',  requestId: 'req-h4i5j6', timestamp: new Date(Date.now() - 2*24*3600_000) },
];

const OUTCOME_MAP: Record<string, 'success' | 'danger' | 'neutral'> = { SUCCESS: 'success', FAILURE: 'danger', PARTIAL: 'neutral' };

@Component({
  selector: 'asms-audit-logs',
  standalone: true,
  imports: [
    DatePipe, MatTableModule, MatPaginatorModule, MatButtonModule, MatIconModule, MatCardModule, MatTooltipModule,
    PageHeaderComponent, StatusChipComponent, SearchInputComponent,
  ],
  templateUrl: './audit-logs.component.html',
  styleUrl: './audit-logs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuditLogsComponent {
  readonly displayedColumns = ['actor', 'eventType', 'targetType', 'outcome', 'ip', 'requestId', 'timestamp'];
  readonly outcomeMap = OUTCOME_MAP;

  readonly searchTerm = signal('');
  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);
  readonly all = signal<MockAuditEntry[]>(MOCK);

  readonly filtered = computed(() => {
    const q = this.searchTerm().toLowerCase();
    return this.all().filter(e => !q || e.actorUsername.includes(q) || e.eventType.toLowerCase().includes(q));
  });

  readonly paged = computed(() => this.filtered().slice(this.pageIndex() * this.pageSize(), (this.pageIndex() + 1) * this.pageSize()));
  readonly total = computed(() => this.filtered().length);

  onSearch(q: string): void { this.searchTerm.set(q); this.pageIndex.set(0); }
  onPage(e: PageEvent): void { this.pageIndex.set(e.pageIndex); this.pageSize.set(e.pageSize); }

  requestExport(): void {
    // Mock export — in real impl would call audit store
    alert('Export requested — CSV will be generated and emailed.');
  }
}
