import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { PageEvent } from '@angular/material/paginator';
import { AlertDto } from '@babakmirghafari/asms-api-client';
import { AlertsStore } from './alerts.store';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { DataTableComponent, ColumnDef, TableAction } from '../../shared/components/data-table/data-table.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog.component';

const SEV_MAP: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'critical'> = { LOW: 'success', MEDIUM: 'warning', HIGH: 'danger', CRITICAL: 'critical' };
const STATUS_MAP: Record<string, 'danger' | 'warning' | 'success' | 'neutral'> = { OPEN: 'danger', ACKNOWLEDGED: 'warning', RESOLVED: 'success', SUPPRESSED: 'neutral' };
const COLS: ColumnDef<AlertDto>[] = [
  { key: 'alertType', label: 'Type', sortable: true },
  { key: 'severity', label: 'Severity', type: 'status', statusMap: SEV_MAP },
  { key: 'status', label: 'Status', type: 'status', statusMap: STATUS_MAP },
  { key: 'actorUsername', label: 'Actor' },
  { key: 'riskScore', label: 'Risk Score' },
  { key: 'createdAt', label: 'Created', type: 'date', sortable: true },
];
const ACTIONS: TableAction[] = [
  { action: 'acknowledge', label: 'Acknowledge', icon: 'check_circle' },
  { action: 'resolve', label: 'Resolve', icon: 'done_all', color: 'var(--color-success)' },
  { action: 'escalate', label: 'Escalate', icon: 'warning', color: 'var(--color-danger)' },
];

@Component({
  selector: 'asms-alerts',
  standalone: true,
  imports: [MatSnackBarModule, MatSelectModule, MatFormFieldModule, PageHeaderComponent, DataTableComponent],
  providers: [AlertsStore],
  templateUrl: './alerts.component.html',
  styleUrl: './alerts.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertsComponent implements OnInit {
  readonly store = inject(AlertsStore);
  private dialog = inject(MatDialog);
  private snack  = inject(MatSnackBar);
  readonly columns = COLS; readonly actions = ACTIONS;
  readonly severities = ['', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  readonly statuses   = ['', 'OPEN', 'ACKNOWLEDGED', 'RESOLVED', 'SUPPRESSED'];

  async ngOnInit() { await this.store.load(); this.showErr(); }
  async onPage(e: PageEvent) { this.store.setPage(e.pageIndex, e.pageSize); await this.store.load(); }
  async onSeverityFilter(v: string) { this.store.setSeverityFilter(v); await this.store.load(); }
  async onStatusFilter(v: string)   { this.store.setStatusFilter(v);   await this.store.load(); }

  async onAction(ev: { action: string; row: AlertDto }) {
    if (ev.action === 'acknowledge') {
      const ok = await this.store.acknowledge(ev.row.id, { note: 'Acknowledged by admin' });
      if (ok) this.snack.open('Alert acknowledged', 'Close', { duration: 3000 }); else this.showErr();
    } else if (ev.action === 'resolve') {
      const ref = this.dialog.open(ConfirmDialogComponent, { data: { title: 'Resolve Alert', message: `Resolve alert "${ev.row.alertType}"?`, confirmLabel: 'Resolve' } as ConfirmDialogData, width: '400px' });
      ref.afterClosed().subscribe(async (ok) => { if (ok) { const r = await this.store.resolve(ev.row.id, { note: 'Resolved by admin' }); if (r) this.snack.open('Resolved', 'Close', { duration: 3000 }); else this.showErr(); } });
    } else if (ev.action === 'escalate') {
      const ok = await this.store.escalate(ev.row.id, { reason: 'Escalated by admin', escalateTo: 'security-team' });
      if (ok) this.snack.open('Alert escalated', 'Close', { duration: 3000 }); else this.showErr();
    }
  }

  private showErr() { const e = this.store.error(); if (e) { this.snack.open(e, 'Dismiss', { duration: 5000 }); this.store.clearError(); } }
}
