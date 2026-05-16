import { Component, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusChipComponent } from '../../shared/components/status-chip/status-chip.component';
import { SearchInputComponent } from '../../shared/components/search-input/search-input.component';

interface MockGroup {
  id: string;
  name: string;
  description: string;
  status: string;
  memberCount: number;
  permissionCount: number;
  organization: string;
  createdAt: Date;
}

const MOCK: MockGroup[] = [
  { id: '1', name: 'Super Admins',     description: 'Full system access',              status: 'ACTIVE',   memberCount: 3,  permissionCount: 42, organization: 'Acme Corporation', createdAt: new Date('2024-01-01') },
  { id: '2', name: 'Security Team',    description: 'Security monitoring and response', status: 'ACTIVE',   memberCount: 8,  permissionCount: 28, organization: 'Acme Corporation', createdAt: new Date('2024-01-15') },
  { id: '3', name: 'Developers',       description: 'Development environment access',   status: 'ACTIVE',   memberCount: 45, permissionCount: 18, organization: 'Acme Corporation', createdAt: new Date('2024-02-01') },
  { id: '4', name: 'HR Managers',      description: 'HR system read/write access',      status: 'ACTIVE',   memberCount: 12, permissionCount: 15, organization: 'Beta Industries',  createdAt: new Date('2024-02-20') },
  { id: '5', name: 'Auditors',         description: 'Read-only audit access',           status: 'ACTIVE',   memberCount: 5,  permissionCount: 8,  organization: 'Gamma Tech',       createdAt: new Date('2024-03-10') },
  { id: '6', name: 'Support Staff',    description: 'Customer support tools',           status: 'ACTIVE',   memberCount: 22, permissionCount: 12, organization: 'Delta Solutions',  createdAt: new Date('2024-04-05') },
  { id: '7', name: 'Compliance Team',  description: 'Regulatory compliance access',     status: 'ACTIVE',   memberCount: 6,  permissionCount: 20, organization: 'Acme Corporation', createdAt: new Date('2024-05-01') },
  { id: '8', name: 'Legacy Group',     description: 'Deprecated permissions group',     status: 'DEPRECATED', memberCount: 0, permissionCount: 5, organization: 'Acme Corporation', createdAt: new Date('2023-06-01') },
];

const STATUS_MAP: Record<string, 'success' | 'neutral' | 'danger'> = { ACTIVE: 'success', INACTIVE: 'neutral', DEPRECATED: 'danger' };

@Component({
  selector: 'asms-permission-groups',
  standalone: true,
  imports: [
    DatePipe, MatTableModule, MatPaginatorModule, MatButtonModule, MatIconModule, MatMenuModule, MatCardModule,
    PageHeaderComponent, StatusChipComponent, SearchInputComponent,
  ],
  templateUrl: './permission-groups.component.html',
  styleUrl: './permission-groups.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PermissionGroupsComponent {
  readonly displayedColumns = ['name', 'organization', 'status', 'memberCount', 'permissionCount', 'createdAt', 'actions'];
  readonly statusMap = STATUS_MAP;

  readonly searchTerm = signal('');
  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);
  readonly all = signal<MockGroup[]>(MOCK);

  readonly filtered = computed(() => {
    const q = this.searchTerm().toLowerCase();
    return this.all().filter(g => !q || g.name.toLowerCase().includes(q));
  });

  readonly paged = computed(() => this.filtered().slice(this.pageIndex() * this.pageSize(), (this.pageIndex() + 1) * this.pageSize()));
  readonly total = computed(() => this.filtered().length);

  onSearch(q: string): void { this.searchTerm.set(q); this.pageIndex.set(0); }
  onPage(e: PageEvent): void { this.pageIndex.set(e.pageIndex); this.pageSize.set(e.pageSize); }
}
