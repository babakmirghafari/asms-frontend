import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PageEvent } from '@angular/material/paginator';
import { AuditLogEntryDto } from '@babakmirghafari/asms-api-client';
import { AuditLogsStore } from './audit-logs.store';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { DataTableComponent, ColumnDef } from '../../shared/components/data-table/data-table.component';

const OUTCOME_MAP: Record<string, 'success' | 'danger' | 'neutral'> = { SUCCESS: 'success', FAILURE: 'danger', PARTIAL: 'neutral' };
const COLS: ColumnDef<AuditLogEntryDto>[] = [
  { key: 'actorUsername', label: 'Actor', sortable: true },
  { key: 'eventType', label: 'Event Type' },
  { key: 'targetType', label: 'Target Type' },
  { key: 'outcome', label: 'Outcome', type: 'status', statusMap: OUTCOME_MAP },
  { key: 'ipAddress', label: 'IP Address' },
  { key: 'timestamp', label: 'Timestamp', type: 'date', sortable: true },
];

@Component({
  selector: 'asms-audit-logs',
  standalone: true,
  imports: [MatSnackBarModule, MatButtonModule, MatIconModule, PageHeaderComponent, DataTableComponent],
  providers: [AuditLogsStore],
  templateUrl: './audit-logs.component.html',
  styleUrl: './audit-logs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuditLogsComponent implements OnInit {
  readonly store = inject(AuditLogsStore);
  private snack  = inject(MatSnackBar);
  readonly columns = COLS;

  async ngOnInit() { await this.store.load(); this.showErr(); }
  async onPage(e: PageEvent) { this.store.setPage(e.pageIndex, e.pageSize); await this.store.load(); }

  async requestExport() {
    const exportId = await this.store.requestExport({ format: 'CSV', organizationId: 'default', fromDate: new Date(Date.now() - 30*24*60*60*1000).toISOString(), toDate: new Date().toISOString() });
    if (exportId) this.snack.open(`Export requested (ID: ${exportId})`, 'Close', { duration: 5000 });
    else this.showErr();
  }

  private showErr() { const e = this.store.error(); if (e) { this.snack.open(e, 'Dismiss', { duration: 5000 }); this.store.clearError(); } }
}
