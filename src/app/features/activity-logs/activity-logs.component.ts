import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PageEvent } from '@angular/material/paginator';
import { ActivityLogDto } from '@babakmirghafari/asms-api-client';
import { ActivityLogsStore } from './activity-logs.store';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { DataTableComponent, ColumnDef } from '../../shared/components/data-table/data-table.component';

const COLS: ColumnDef<ActivityLogDto>[] = [
  { key: 'actorUsername', label: 'Actor', sortable: true },
  { key: 'eventType', label: 'Event Type' },
  { key: 'category', label: 'Category' },
  { key: 'targetDisplayName', label: 'Target' },
  { key: 'timestamp', label: 'Time', type: 'date', sortable: true },
];

@Component({
  selector: 'asms-activity-logs',
  standalone: true,
  imports: [MatSnackBarModule, PageHeaderComponent, DataTableComponent],
  providers: [ActivityLogsStore],
  templateUrl: './activity-logs.component.html',
  styleUrl: './activity-logs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActivityLogsComponent implements OnInit {
  readonly store = inject(ActivityLogsStore);
  private snack  = inject(MatSnackBar);
  readonly columns = COLS;
  private readonly orgId = 'default';

  async ngOnInit() { await this.store.load(this.orgId); this.showErr(); }
  async onPage(e: PageEvent) { this.store.setPage(e.pageIndex, e.pageSize); await this.store.load(this.orgId); }
  private showErr() { const e = this.store.error(); if (e) { this.snack.open(e, 'Dismiss', { duration: 5000 }); this.store.clearError(); } }
}
