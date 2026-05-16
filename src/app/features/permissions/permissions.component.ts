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
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusChipComponent } from '../../shared/components/status-chip/status-chip.component';
import { SearchInputComponent } from '../../shared/components/search-input/search-input.component';

interface MockPermission {
  id: string;
  name: string;
  resource: string;
  action: string;
  scope: string;
  status: string;
  createdAt: Date;
}

const MOCK: MockPermission[] = [
  { id: '1',  name: 'users:read',         resource: 'users',           action: 'READ',   scope: 'GLOBAL',  status: 'ACTIVE',     createdAt: new Date('2024-01-01') },
  { id: '2',  name: 'users:write',        resource: 'users',           action: 'WRITE',  scope: 'GLOBAL',  status: 'ACTIVE',     createdAt: new Date('2024-01-01') },
  { id: '3',  name: 'users:delete',       resource: 'users',           action: 'DELETE', scope: 'GLOBAL',  status: 'ACTIVE',     createdAt: new Date('2024-01-01') },
  { id: '4',  name: 'orgs:read',          resource: 'organizations',   action: 'READ',   scope: 'ORG',     status: 'ACTIVE',     createdAt: new Date('2024-01-05') },
  { id: '5',  name: 'orgs:write',         resource: 'organizations',   action: 'WRITE',  scope: 'ORG',     status: 'ACTIVE',     createdAt: new Date('2024-01-05') },
  { id: '6',  name: 'sessions:revoke',    resource: 'sessions',        action: 'ADMIN',  scope: 'GLOBAL',  status: 'ACTIVE',     createdAt: new Date('2024-01-10') },
  { id: '7',  name: 'alerts:manage',      resource: 'alerts',          action: 'WRITE',  scope: 'GLOBAL',  status: 'ACTIVE',     createdAt: new Date('2024-01-10') },
  { id: '8',  name: 'audit:export',       resource: 'audit-logs',      action: 'READ',   scope: 'ORG',     status: 'ACTIVE',     createdAt: new Date('2024-01-15') },
  { id: '9',  name: 'policy:update',      resource: 'auth-policies',   action: 'WRITE',  scope: 'ORG',     status: 'ACTIVE',     createdAt: new Date('2024-01-20') },
  { id: '10', name: 'apps:manage',        resource: 'applications',    action: 'ADMIN',  scope: 'ORG',     status: 'ACTIVE',     createdAt: new Date('2024-01-25') },
  { id: '11', name: 'reports:view',       resource: 'reports',         action: 'READ',   scope: 'ORG',     status: 'ACTIVE',     createdAt: new Date('2024-02-01') },
  { id: '12', name: 'legacy:access',      resource: 'legacy-api',      action: 'READ',   scope: 'GLOBAL',  status: 'DEPRECATED', createdAt: new Date('2023-06-01') },
];

const STATUS_MAP: Record<string, 'success' | 'neutral' | 'danger'> = { ACTIVE: 'success', INACTIVE: 'neutral', DEPRECATED: 'danger' };
const ACTION_COLORS: Record<string, string> = { READ: '#10b981', WRITE: '#3b82f6', DELETE: '#ef4444', ADMIN: '#8b5cf6' };

@Component({
  selector: 'asms-permissions',
  standalone: true,
  imports: [
    DatePipe, MatTableModule, MatPaginatorModule, MatButtonModule, MatIconModule, MatMenuModule, MatCardModule, MatSelectModule, MatFormFieldModule,
    PageHeaderComponent, StatusChipComponent, SearchInputComponent,
  ],
  templateUrl: './permissions.component.html',
  styleUrl: './permissions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PermissionsComponent {
  readonly displayedColumns = ['name', 'resource', 'action', 'scope', 'status', 'createdAt', 'actions'];
  readonly statusMap = STATUS_MAP;

  readonly searchTerm = signal('');
  readonly resourceFilter = signal('');
  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);
  readonly all = signal<MockPermission[]>(MOCK);

  readonly resources = computed(() => [...new Set(this.all().map(p => p.resource))]);

  readonly filtered = computed(() => {
    const q = this.searchTerm().toLowerCase();
    const r = this.resourceFilter();
    return this.all().filter(p =>
      (!q || p.name.includes(q) || p.resource.includes(q)) &&
      (!r || p.resource === r)
    );
  });

  readonly paged = computed(() => this.filtered().slice(this.pageIndex() * this.pageSize(), (this.pageIndex() + 1) * this.pageSize()));
  readonly total = computed(() => this.filtered().length);

  onSearch(q: string): void { this.searchTerm.set(q); this.pageIndex.set(0); }
  onResourceFilter(r: string): void { this.resourceFilter.set(r); this.pageIndex.set(0); }
  onPage(e: PageEvent): void { this.pageIndex.set(e.pageIndex); this.pageSize.set(e.pageSize); }
  actionColor(a: string): string { return ACTION_COLORS[a] ?? '#6b7280'; }
}
