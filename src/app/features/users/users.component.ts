import { Component, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatCardModule } from '@angular/material/card';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusChipComponent } from '../../shared/components/status-chip/status-chip.component';
import { SearchInputComponent } from '../../shared/components/search-input/search-input.component';

interface MockUser {
  id: string;
  username: string;
  displayName: string;
  email: string;
  status: string;
  lastLoginAt: Date;
  createdAt: Date;
  organization: string;
  mfaEnabled: boolean;
}

const MOCK_USERS: MockUser[] = [
  { id: '1',  username: 'alice.morgan',    displayName: 'Alice Morgan',    email: 'alice.morgan@acme.com',     status: 'ACTIVE',                 lastLoginAt: new Date(Date.now() - 2*60_000),       createdAt: new Date('2024-01-15'), organization: 'Acme Corporation', mfaEnabled: true  },
  { id: '2',  username: 'bob.chen',        displayName: 'Bob Chen',        email: 'bob.chen@acme.com',         status: 'ACTIVE',                 lastLoginAt: new Date(Date.now() - 25*60_000),      createdAt: new Date('2024-02-03'), organization: 'Acme Corporation', mfaEnabled: true  },
  { id: '3',  username: 'carol.smith',     displayName: 'Carol Smith',     email: 'carol.smith@beta.com',      status: 'INACTIVE',               lastLoginAt: new Date(Date.now() - 14*24*3600_000), createdAt: new Date('2024-03-20'), organization: 'Beta Industries',  mfaEnabled: false },
  { id: '4',  username: 'dana.patel',      displayName: 'Dana Patel',      email: 'dana.patel@acme.com',       status: 'ACTIVE',                 lastLoginAt: new Date(Date.now() - 3600_000),       createdAt: new Date('2024-01-28'), organization: 'Acme Corporation', mfaEnabled: true  },
  { id: '5',  username: 'evan.jones',      displayName: 'Evan Jones',      email: 'evan.jones@gamma.com',      status: 'LOCKED',                 lastLoginAt: new Date(Date.now() - 3*24*3600_000),  createdAt: new Date('2024-04-10'), organization: 'Gamma Tech',       mfaEnabled: false },
  { id: '6',  username: 'fiona.wright',    displayName: 'Fiona Wright',    email: 'fiona.wright@delta.com',    status: 'ACTIVE',                 lastLoginAt: new Date(Date.now() - 15*60_000),      createdAt: new Date('2024-05-01'), organization: 'Delta Solutions',  mfaEnabled: true  },
  { id: '7',  username: 'george.kim',      displayName: 'George Kim',      email: 'george.kim@beta.com',       status: 'TEMP_PASSWORD',          lastLoginAt: new Date(Date.now() - 2*24*3600_000),  createdAt: new Date('2025-01-05'), organization: 'Beta Industries',  mfaEnabled: false },
  { id: '8',  username: 'helen.lee',       displayName: 'Helen Lee',       email: 'helen.lee@acme.com',        status: 'ACTIVE',                 lastLoginAt: new Date(Date.now() - 8*60_000),       createdAt: new Date('2024-06-12'), organization: 'Acme Corporation', mfaEnabled: true  },
  { id: '9',  username: 'ian.scott',       displayName: 'Ian Scott',       email: 'ian.scott@epsilon.com',     status: 'PENDING_MFA_ENROLLMENT', lastLoginAt: new Date(Date.now() - 45*60_000),      createdAt: new Date('2025-03-18'), organization: 'Epsilon Group',    mfaEnabled: false },
  { id: '10', username: 'julia.tang',      displayName: 'Julia Tang',      email: 'julia.tang@gamma.com',      status: 'ACTIVE',                 lastLoginAt: new Date(Date.now() - 90*60_000),      createdAt: new Date('2024-07-22'), organization: 'Gamma Tech',       mfaEnabled: true  },
  { id: '11', username: 'kevin.brown',     displayName: 'Kevin Brown',     email: 'kevin.brown@delta.com',     status: 'ACTIVE',                 lastLoginAt: new Date(Date.now() - 5*60_000),       createdAt: new Date('2024-08-14'), organization: 'Delta Solutions',  mfaEnabled: true  },
  { id: '12', username: 'laura.chen',      displayName: 'Laura Chen',      email: 'laura.chen@acme.com',       status: 'INACTIVE',               lastLoginAt: new Date(Date.now() - 30*24*3600_000), createdAt: new Date('2024-02-28'), organization: 'Acme Corporation', mfaEnabled: false },
  { id: '13', username: 'mike.taylor',     displayName: 'Mike Taylor',     email: 'mike.taylor@beta.com',      status: 'ACTIVE',                 lastLoginAt: new Date(Date.now() - 20*60_000),      createdAt: new Date('2024-09-05'), organization: 'Beta Industries',  mfaEnabled: true  },
  { id: '14', username: 'nina.wilson',     displayName: 'Nina Wilson',     email: 'nina.wilson@epsilon.com',   status: 'LOCKED',                 lastLoginAt: new Date(Date.now() - 5*24*3600_000),  createdAt: new Date('2024-10-01'), organization: 'Epsilon Group',    mfaEnabled: false },
  { id: '15', username: 'oliver.garcia',   displayName: 'Oliver Garcia',   email: 'oliver.garcia@gamma.com',   status: 'ACTIVE',                 lastLoginAt: new Date(Date.now() - 30*60_000),      createdAt: new Date('2024-11-11'), organization: 'Gamma Tech',       mfaEnabled: true  },
];

const STATUS_MAP: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' }> = {
  ACTIVE:                 { label: 'Active',         variant: 'success'  },
  INACTIVE:               { label: 'Inactive',       variant: 'neutral'  },
  LOCKED:                 { label: 'Locked',         variant: 'danger'   },
  TEMP_PASSWORD:          { label: 'Temp Password',  variant: 'warning'  },
  PENDING_MFA_ENROLLMENT: { label: 'Pending MFA',    variant: 'info'     },
};

@Component({
  selector: 'asms-users',
  standalone: true,
  imports: [
    FormsModule,
    DatePipe,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatChipsModule,
    MatCardModule,
    PageHeaderComponent,
    StatusChipComponent,
    SearchInputComponent,
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersComponent {
  readonly displayedColumns = ['avatar', 'username', 'email', 'organization', 'status', 'mfa', 'lastLoginAt', 'actions'];
  readonly statusOptions = Object.keys(STATUS_MAP);
  readonly statusMapVariants: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
    ACTIVE: 'success', INACTIVE: 'neutral', LOCKED: 'danger', TEMP_PASSWORD: 'warning', PENDING_MFA_ENROLLMENT: 'info'
  };

  readonly searchTerm = signal('');
  readonly statusFilter = signal('');
  readonly pageIndex = signal(0);
  readonly pageSize = signal(15);

  readonly allUsers = signal<MockUser[]>(MOCK_USERS);

  readonly filtered = computed(() => {
    const q = this.searchTerm().toLowerCase();
    const s = this.statusFilter();
    return this.allUsers().filter(u =>
      (!q || u.username.includes(q) || u.displayName.toLowerCase().includes(q) || u.email.includes(q)) &&
      (!s || u.status === s)
    );
  });

  readonly pagedUsers = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.filtered().slice(start, start + this.pageSize());
  });

  readonly totalCount = computed(() => this.filtered().length);

  onSearch(q: string): void { this.searchTerm.set(q); this.pageIndex.set(0); }
  onStatusFilter(s: string): void { this.statusFilter.set(s); this.pageIndex.set(0); }
  onPage(e: PageEvent): void { this.pageIndex.set(e.pageIndex); this.pageSize.set(e.pageSize); }

  getInitials(name: string): string {
    return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
  }

  avatarColor(id: string): string {
    const colors = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#ef4444','#06b6d4','#ec4899','#14b8a6'];
    return colors[parseInt(id, 10) % colors.length];
  }

  statusLabel(status: string): string {
    return STATUS_MAP[status]?.label ?? status;
  }

  lockUser(user: MockUser): void {
    this.allUsers.update(list => list.map(u => u.id === user.id ? { ...u, status: 'LOCKED' } : u));
  }

  unlockUser(user: MockUser): void {
    this.allUsers.update(list => list.map(u => u.id === user.id ? { ...u, status: 'ACTIVE' } : u));
  }

  deleteUser(user: MockUser): void {
    this.allUsers.update(list => list.filter(u => u.id !== user.id));
  }
}
