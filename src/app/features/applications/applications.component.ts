import { Component, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusChipComponent } from '../../shared/components/status-chip/status-chip.component';
import { SearchInputComponent } from '../../shared/components/search-input/search-input.component';

interface MockApp {
  id: string;
  name: string;
  connectorType: string;
  status: string;
  clientId: string;
  organization: string;
  lastUsedAt: Date;
  createdAt: Date;
}

const MOCK: MockApp[] = [
  { id: '1',  name: 'Acme Web Portal',    connectorType: 'OIDC',   status: 'ACTIVE',   clientId: 'cli-acme-web-001',    organization: 'Acme Corporation', lastUsedAt: new Date(Date.now() - 5*60_000),       createdAt: new Date('2024-01-10') },
  { id: '2',  name: 'Acme Mobile App',    connectorType: 'OIDC',   status: 'ACTIVE',   clientId: 'cli-acme-mob-002',    organization: 'Acme Corporation', lastUsedAt: new Date(Date.now() - 30*60_000),      createdAt: new Date('2024-02-15') },
  { id: '3',  name: 'Beta ERP System',    connectorType: 'SAML',   status: 'ACTIVE',   clientId: 'cli-beta-erp-003',    organization: 'Beta Industries',  lastUsedAt: new Date(Date.now() - 2*3600_000),     createdAt: new Date('2024-03-01') },
  { id: '4',  name: 'Beta Analytics',     connectorType: 'OAuth2', status: 'ACTIVE',   clientId: 'cli-beta-ana-004',    organization: 'Beta Industries',  lastUsedAt: new Date(Date.now() - 6*3600_000),     createdAt: new Date('2024-04-05') },
  { id: '5',  name: 'Gamma DevTools',     connectorType: 'OIDC',   status: 'ACTIVE',   clientId: 'cli-gam-dev-005',     organization: 'Gamma Tech',       lastUsedAt: new Date(Date.now() - 1*3600_000),     createdAt: new Date('2024-05-20') },
  { id: '6',  name: 'Delta HR Portal',    connectorType: 'SAML',   status: 'INACTIVE', clientId: 'cli-del-hr-006',      organization: 'Delta Solutions',  lastUsedAt: new Date(Date.now() - 14*24*3600_000), createdAt: new Date('2024-02-28') },
  { id: '7',  name: 'Epsilon Dashboard',  connectorType: 'OIDC',   status: 'ACTIVE',   clientId: 'cli-eps-dash-007',    organization: 'Epsilon Group',    lastUsedAt: new Date(Date.now() - 4*3600_000),     createdAt: new Date('2024-06-10') },
  { id: '8',  name: 'Acme Admin Console', connectorType: 'OAuth2', status: 'ACTIVE',   clientId: 'cli-acme-adm-008',   organization: 'Acme Corporation', lastUsedAt: new Date(Date.now() - 20*60_000),      createdAt: new Date('2024-01-25') },
  { id: '9',  name: 'Zeta Reporting',     connectorType: 'API_KEY',status: 'SUSPENDED',clientId: 'cli-zeta-rep-009',   organization: 'Zeta Financial',   lastUsedAt: new Date(Date.now() - 7*24*3600_000),  createdAt: new Date('2024-03-18') },
  { id: '10', name: 'Theta CRM',          connectorType: 'SAML',   status: 'ACTIVE',   clientId: 'cli-thet-crm-010',   organization: 'Theta Digital',    lastUsedAt: new Date(Date.now() - 45*60_000),      createdAt: new Date('2024-07-01') },
];

const STATUS_MAP: Record<string, 'success' | 'neutral' | 'danger'> = { ACTIVE: 'success', INACTIVE: 'neutral', SUSPENDED: 'danger' };

const CONNECTOR_COLORS: Record<string, string> = {
  OIDC: '#3b82f6', SAML: '#8b5cf6', OAuth2: '#10b981', API_KEY: '#f59e0b'
};

@Component({
  selector: 'asms-applications',
  standalone: true,
  imports: [
    DatePipe, MatTableModule, MatPaginatorModule, MatButtonModule, MatIconModule, MatMenuModule, MatCardModule, MatTooltipModule,
    PageHeaderComponent, StatusChipComponent, SearchInputComponent,
  ],
  templateUrl: './applications.component.html',
  styleUrl: './applications.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationsComponent {
  readonly displayedColumns = ['name', 'connectorType', 'organization', 'status', 'clientId', 'lastUsedAt', 'actions'];
  readonly statusMap = STATUS_MAP;
  readonly connectorColors = CONNECTOR_COLORS;

  readonly searchTerm = signal('');
  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);
  readonly all = signal<MockApp[]>(MOCK);

  readonly filtered = computed(() => {
    const q = this.searchTerm().toLowerCase();
    return this.all().filter(a => !q || a.name.toLowerCase().includes(q) || a.organization.toLowerCase().includes(q));
  });

  readonly paged = computed(() => this.filtered().slice(this.pageIndex() * this.pageSize(), (this.pageIndex() + 1) * this.pageSize()));
  readonly total = computed(() => this.filtered().length);

  onSearch(q: string): void { this.searchTerm.set(q); this.pageIndex.set(0); }
  onPage(e: PageEvent): void { this.pageIndex.set(e.pageIndex); this.pageSize.set(e.pageSize); }
  connectorColor(t: string): string { return CONNECTOR_COLORS[t] ?? '#6b7280'; }
}
