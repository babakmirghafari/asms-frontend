import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { SessionDto } from '@babakmirghafari/asms-api-client';
import { SessionsStore } from './sessions.store';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { DataTableComponent, ColumnDef, TableAction } from '../../shared/components/data-table/data-table.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog.component';

const STATUS_MAP: Record<string, 'success' | 'danger' | 'neutral'> = { ACTIVE: 'success', REVOKED: 'danger', EXPIRED: 'neutral' };
const COLS: ColumnDef<SessionDto>[] = [
  { key: 'username', label: 'User', sortable: true },
  { key: 'organizationName', label: 'Organization', sortable: true },
  { key: 'status', label: 'Status', type: 'status', statusMap: STATUS_MAP },
  { key: 'ipAddress', label: 'IP Address' },
  { key: 'riskScore', label: 'Risk Score' },
  { key: 'createdAt', label: 'Created', type: 'date', sortable: true },
];
const ACTIONS: TableAction[] = [{ action: 'revoke', label: 'Revoke', icon: 'block', color: 'var(--color-danger)' }];

@Component({
  selector: 'asms-sessions',
  standalone: true,
  imports: [MatSnackBarModule, PageHeaderComponent, DataTableComponent],
  providers: [SessionsStore],
  templateUrl: './sessions.component.html',
  styleUrl: './sessions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionsComponent implements OnInit {
  readonly store = inject(SessionsStore);
  private dialog = inject(MatDialog);
  private snack  = inject(MatSnackBar);
  readonly columns = COLS; readonly actions = ACTIONS;

  async ngOnInit() { await this.store.load(); this.showErr(); }
  async onPage(e: PageEvent) { this.store.setPage(e.pageIndex, e.pageSize); await this.store.load(); }

  async onAction(ev: { action: string; row: SessionDto }) {
    if (ev.action === 'revoke') {
      const ref = this.dialog.open(ConfirmDialogComponent, { data: { title: 'Revoke Session', message: `Revoke session for "${ev.row.username}"?`, confirmLabel: 'Revoke', danger: true } as ConfirmDialogData, width: '400px' });
      ref.afterClosed().subscribe(async (ok) => { if (ok) { const r = await this.store.revoke(ev.row.id, { reason: 'Admin revoked' }); if (r) this.snack.open('Session revoked', 'Close', { duration: 3000 }); else this.showErr(); } });
    }
  }

  private showErr() { const e = this.store.error(); if (e) { this.snack.open(e, 'Dismiss', { duration: 5000 }); this.store.clearError(); } }
}
