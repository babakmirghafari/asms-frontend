import { Component, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusChipComponent } from '../../shared/components/status-chip/status-chip.component';
import { SearchInputComponent } from '../../shared/components/search-input/search-input.component';

interface MockStationPolicy {
  id: string;
  name: string;
  status: string;
  workStartTime: string;
  workEndTime: string;
  timezone: string;
  allowedDays: string[];
  maxConcurrentSessions: number;
  requiredLocation: string;
  organization: string;
  createdAt: Date;
}

const MOCK: MockStationPolicy[] = [
  { id: '1', name: 'Office Hours Only',     status: 'ACTIVE',   workStartTime: '08:00', workEndTime: '18:00', timezone: 'UTC+0',  allowedDays: ['Mon','Tue','Wed','Thu','Fri'], maxConcurrentSessions: 1, requiredLocation: 'London HQ',     organization: 'Acme Corporation', createdAt: new Date('2024-01-10') },
  { id: '2', name: 'Extended Hours',        status: 'ACTIVE',   workStartTime: '06:00', workEndTime: '22:00', timezone: 'UTC-5',  allowedDays: ['Mon','Tue','Wed','Thu','Fri','Sat'], maxConcurrentSessions: 2, requiredLocation: 'New York Office', organization: 'Beta Industries',  createdAt: new Date('2024-02-15') },
  { id: '3', name: 'Night Shift',           status: 'ACTIVE',   workStartTime: '20:00', workEndTime: '06:00', timezone: 'UTC+1',  allowedDays: ['Mon','Tue','Wed','Thu','Fri'], maxConcurrentSessions: 1, requiredLocation: 'Berlin Office', organization: 'Gamma Tech',       createdAt: new Date('2024-03-01') },
  { id: '4', name: 'Weekend On-Call',       status: 'ACTIVE',   workStartTime: '09:00', workEndTime: '17:00', timezone: 'UTC+0',  allowedDays: ['Sat','Sun'], maxConcurrentSessions: 1, requiredLocation: 'Remote',        organization: 'Acme Corporation', createdAt: new Date('2024-04-05') },
  { id: '5', name: 'Legacy Kiosk Policy',   status: 'INACTIVE', workStartTime: '09:00', workEndTime: '17:00', timezone: 'UTC+0',  allowedDays: ['Mon','Tue','Wed','Thu','Fri'], maxConcurrentSessions: 1, requiredLocation: 'Old Lobby',     organization: 'Delta Solutions',  createdAt: new Date('2023-12-01') },
  { id: '6', name: 'US East Coast',         status: 'ACTIVE',   workStartTime: '08:00', workEndTime: '20:00', timezone: 'UTC-5',  allowedDays: ['Mon','Tue','Wed','Thu','Fri'], maxConcurrentSessions: 3, requiredLocation: 'Boston Office', organization: 'Epsilon Group',    createdAt: new Date('2024-05-20') },
];

const STATUS_MAP: Record<string, 'success' | 'neutral'> = { ACTIVE: 'success', INACTIVE: 'neutral' };

@Component({
  selector: 'asms-station-policies',
  standalone: true,
  imports: [
    MatTableModule, MatPaginatorModule, MatButtonModule, MatIconModule, MatMenuModule, MatCardModule, MatChipsModule,
    PageHeaderComponent, StatusChipComponent, SearchInputComponent,
  ],
  templateUrl: './station-policies.component.html',
  styleUrl: './station-policies.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StationPoliciesComponent {
  readonly displayedColumns = ['name', 'schedule', 'location', 'status', 'maxSessions', 'organization', 'actions'];
  readonly statusMap = STATUS_MAP;

  readonly searchTerm = signal('');
  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);
  readonly all = signal<MockStationPolicy[]>(MOCK);

  readonly filtered = computed(() => {
    const q = this.searchTerm().toLowerCase();
    return this.all().filter(p => !q || p.name.toLowerCase().includes(q) || p.organization.toLowerCase().includes(q));
  });

  readonly paged = computed(() => this.filtered().slice(this.pageIndex() * this.pageSize(), (this.pageIndex() + 1) * this.pageSize()));
  readonly total = computed(() => this.filtered().length);

  onSearch(q: string): void { this.searchTerm.set(q); this.pageIndex.set(0); }
  onPage(e: PageEvent): void { this.pageIndex.set(e.pageIndex); this.pageSize.set(e.pageSize); }
}
