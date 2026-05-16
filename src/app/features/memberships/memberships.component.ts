import { Component, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusChipComponent } from '../../shared/components/status-chip/status-chip.component';
import { SearchInputComponent } from '../../shared/components/search-input/search-input.component';

interface MockMembership {
  id: string;
  username: string;
  displayName: string;
  organizationName: string;
  role: string;
  status: string;
  joinedAt: Date;
}

const MOCK: MockMembership[] = [
  { id: '1',  username: 'alice.morgan',   displayName: 'Alice Morgan',   organizationName: 'Acme Corporation', role: 'Admin',    status: 'ACTIVE',   joinedAt: new Date('2024-01-15') },
  { id: '2',  username: 'bob.chen',       displayName: 'Bob Chen',       organizationName: 'Acme Corporation', role: 'Member',   status: 'ACTIVE',   joinedAt: new Date('2024-02-03') },
  { id: '3',  username: 'carol.smith',    displayName: 'Carol Smith',    organizationName: 'Beta Industries',  role: 'Admin',    status: 'INACTIVE', joinedAt: new Date('2024-03-20') },
  { id: '4',  username: 'dana.patel',     displayName: 'Dana Patel',     organizationName: 'Acme Corporation', role: 'Member',   status: 'ACTIVE',   joinedAt: new Date('2024-01-28') },
  { id: '5',  username: 'evan.jones',     displayName: 'Evan Jones',     organizationName: 'Gamma Tech',       role: 'Viewer',   status: 'ACTIVE',   joinedAt: new Date('2024-04-10') },
  { id: '6',  username: 'fiona.wright',   displayName: 'Fiona Wright',   organizationName: 'Delta Solutions',  role: 'Admin',    status: 'ACTIVE',   joinedAt: new Date('2024-05-01') },
  { id: '7',  username: 'george.kim',     displayName: 'George Kim',     organizationName: 'Beta Industries',  role: 'Member',   status: 'ACTIVE',   joinedAt: new Date('2025-01-05') },
  { id: '8',  username: 'helen.lee',      displayName: 'Helen Lee',      organizationName: 'Acme Corporation', role: 'Member',   status: 'ACTIVE',   joinedAt: new Date('2024-06-12') },
  { id: '9',  username: 'ian.scott',      displayName: 'Ian Scott',      organizationName: 'Epsilon Group',    role: 'Viewer',   status: 'ACTIVE',   joinedAt: new Date('2025-03-18') },
  { id: '10', username: 'julia.tang',     displayName: 'Julia Tang',     organizationName: 'Gamma Tech',       role: 'Admin',    status: 'ACTIVE',   joinedAt: new Date('2024-07-22') },
  { id: '11', username: 'kevin.brown',    displayName: 'Kevin Brown',    organizationName: 'Delta Solutions',  role: 'Member',   status: 'ACTIVE',   joinedAt: new Date('2024-08-14') },
  { id: '12', username: 'laura.chen',     displayName: 'Laura Chen',     organizationName: 'Acme Corporation', role: 'Viewer',   status: 'REVOKED',  joinedAt: new Date('2024-02-28') },
  { id: '13', username: 'alice.morgan',   displayName: 'Alice Morgan',   organizationName: 'Beta Industries',  role: 'Member',   status: 'ACTIVE',   joinedAt: new Date('2024-09-05') },
  { id: '14', username: 'bob.chen',       displayName: 'Bob Chen',       organizationName: 'Gamma Tech',       role: 'Viewer',   status: 'ACTIVE',   joinedAt: new Date('2024-10-01') },
];

const STATUS_MAP: Record<string, 'success' | 'neutral' | 'danger'> = { ACTIVE: 'success', INACTIVE: 'neutral', REVOKED: 'danger' };

@Component({
  selector: 'asms-memberships',
  standalone: true,
  imports: [
    DatePipe, MatTableModule, MatPaginatorModule, MatFormFieldModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatMenuModule, MatCardModule,
    PageHeaderComponent, StatusChipComponent, SearchInputComponent,
  ],
  templateUrl: './memberships.component.html',
  styleUrl: './memberships.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MembershipsComponent {
  readonly displayedColumns = ['user', 'organization', 'role', 'status', 'joinedAt', 'actions'];
  readonly statusMap = STATUS_MAP;

  readonly searchTerm = signal('');
  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);
  readonly all = signal<MockMembership[]>(MOCK);

  readonly filtered = computed(() => {
    const q = this.searchTerm().toLowerCase();
    return this.all().filter(m => !q || m.username.includes(q) || m.organizationName.toLowerCase().includes(q));
  });

  readonly paged = computed(() => this.filtered().slice(this.pageIndex() * this.pageSize(), (this.pageIndex() + 1) * this.pageSize()));
  readonly total = computed(() => this.filtered().length);

  onSearch(q: string): void { this.searchTerm.set(q); this.pageIndex.set(0); }
  onPage(e: PageEvent): void { this.pageIndex.set(e.pageIndex); this.pageSize.set(e.pageSize); }
  removeMembership(m: MockMembership): void { this.all.update(list => list.filter(i => i.id !== m.id)); }

  roleColor(role: string): string {
    return role === 'Admin' ? '#8b5cf6' : role === 'Member' ? '#3b82f6' : '#6b7280';
  }
}
