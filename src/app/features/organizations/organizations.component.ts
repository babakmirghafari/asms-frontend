import { Component, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusChipComponent } from '../../shared/components/status-chip/status-chip.component';
import { SearchInputComponent } from '../../shared/components/search-input/search-input.component';

interface MockOrg {
  id: string;
  name: string;
  status: string;
  memberCount: number;
  appCount: number;
  plan: string;
  createdAt: Date;
  domain: string;
}

const MOCK_ORGS: MockOrg[] = [
  { id: '1', name: 'Acme Corporation',  status: 'ACTIVE',    memberCount: 342, appCount: 8,  plan: 'Enterprise', createdAt: new Date('2023-06-01'), domain: 'acme.com'      },
  { id: '2', name: 'Beta Industries',   status: 'ACTIVE',    memberCount: 218, appCount: 5,  plan: 'Business',   createdAt: new Date('2023-08-15'), domain: 'beta-ind.com'  },
  { id: '3', name: 'Gamma Tech',        status: 'ACTIVE',    memberCount: 156, appCount: 4,  plan: 'Business',   createdAt: new Date('2023-11-01'), domain: 'gammatech.io'  },
  { id: '4', name: 'Delta Solutions',   status: 'ACTIVE',    memberCount: 134, appCount: 3,  plan: 'Starter',    createdAt: new Date('2024-01-10'), domain: 'deltasol.com'  },
  { id: '5', name: 'Epsilon Group',     status: 'ACTIVE',    memberCount: 89,  appCount: 2,  plan: 'Starter',    createdAt: new Date('2024-03-22'), domain: 'epsilon.co'    },
  { id: '6', name: 'Zeta Financial',    status: 'SUSPENDED', memberCount: 54,  appCount: 1,  plan: 'Starter',    createdAt: new Date('2024-02-08'), domain: 'zetafin.com'   },
  { id: '7', name: 'Eta Logistics',     status: 'INACTIVE',  memberCount: 23,  appCount: 1,  plan: 'Starter',    createdAt: new Date('2024-05-30'), domain: 'etalog.net'    },
  { id: '8', name: 'Theta Digital',     status: 'ACTIVE',    memberCount: 178, appCount: 6,  plan: 'Enterprise', createdAt: new Date('2023-09-12'), domain: 'thetadigital.com' },
];

const STATUS_MAP: Record<string, 'success' | 'neutral' | 'danger'> = {
  ACTIVE: 'success', INACTIVE: 'neutral', SUSPENDED: 'danger'
};

@Component({
  selector: 'asms-organizations',
  standalone: true,
  imports: [
    DatePipe, FormsModule,
    MatTableModule, MatPaginatorModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule, MatMenuModule, MatCardModule, MatChipsModule,
    PageHeaderComponent, StatusChipComponent, SearchInputComponent,
  ],
  templateUrl: './organizations.component.html',
  styleUrl: './organizations.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationsComponent {
  readonly displayedColumns = ['avatar', 'name', 'domain', 'plan', 'status', 'memberCount', 'appCount', 'createdAt', 'actions'];
  readonly statusOptions = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];
  readonly statusMap = STATUS_MAP;

  readonly searchTerm = signal('');
  readonly statusFilter = signal('');
  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);
  readonly allOrgs = signal<MockOrg[]>(MOCK_ORGS);

  readonly filtered = computed(() => {
    const q = this.searchTerm().toLowerCase();
    const s = this.statusFilter();
    return this.allOrgs().filter(o =>
      (!q || o.name.toLowerCase().includes(q) || o.domain.includes(q)) &&
      (!s || o.status === s)
    );
  });

  readonly paged = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.filtered().slice(start, start + this.pageSize());
  });

  readonly total = computed(() => this.filtered().length);

  onSearch(q: string): void { this.searchTerm.set(q); this.pageIndex.set(0); }
  onStatusFilter(s: string): void { this.statusFilter.set(s); this.pageIndex.set(0); }
  onPage(e: PageEvent): void { this.pageIndex.set(e.pageIndex); this.pageSize.set(e.pageSize); }

  avatarColor(id: string): string {
    const colors = ['#3b82f6','#8b5cf6','#10b981','#f59e0b','#06b6d4','#ec4899','#ef4444','#14b8a6'];
    return colors[parseInt(id, 10) % colors.length];
  }

  statusLabel(s: string): string {
    return s.charAt(0) + s.slice(1).toLowerCase();
  }

  planColor(plan: string): string {
    return plan === 'Enterprise' ? '#8b5cf6' : plan === 'Business' ? '#3b82f6' : '#6b7280';
  }
}
