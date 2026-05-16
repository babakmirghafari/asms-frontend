import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MembershipDto } from '@babakmirghafari/asms-api-client';
import { MembershipsStore } from './memberships.store';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { DataTableComponent, ColumnDef, TableAction } from '../../shared/components/data-table/data-table.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog.component';

const STATUS_MAP: Record<string, 'success' | 'neutral' | 'danger'> = { ACTIVE: 'success', INACTIVE: 'neutral', REVOKED: 'danger' };
const COLS: ColumnDef<MembershipDto>[] = [
  { key: 'username', label: 'User', sortable: true },
  { key: 'organizationName', label: 'Organization', sortable: true },
  { key: 'status', label: 'Status', type: 'status', statusMap: STATUS_MAP },
  { key: 'createdAt', label: 'Added', type: 'date', sortable: true },
];
const ACTIONS: TableAction[] = [{ action: 'delete', label: 'Remove', icon: 'person_remove', color: 'var(--color-danger)' }];

@Component({
  selector: 'asms-memberships',
  standalone: true,
  imports: [MatSnackBarModule, PageHeaderComponent, DataTableComponent],
  providers: [MembershipsStore],
  templateUrl: './memberships.component.html',
  styleUrl: './memberships.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MembershipsComponent implements OnInit {
  readonly store = inject(MembershipsStore);
  private dialog = inject(MatDialog);
  private snack  = inject(MatSnackBar);
  readonly columns = COLS; readonly actions = ACTIONS;

  async ngOnInit() { await this.store.load(); this.showErr(); }
  async onPage(e: PageEvent) { this.store.setPage(e.pageIndex, e.pageSize); await this.store.load(); }

  async onAction(ev: { action: string; row: MembershipDto }) {
    if (ev.action === 'delete') {
      const ref = this.dialog.open(ConfirmDialogComponent, { data: { title: 'Remove Membership', message: `Remove "${ev.row.username}" from "${ev.row.organizationName}"?`, confirmLabel: 'Remove', danger: true } as ConfirmDialogData, width: '400px' });
      ref.afterClosed().subscribe(async (ok) => { if (ok) { const r = await this.store.remove(ev.row.id); if (r) this.snack.open('Removed', 'Close', { duration: 3000 }); else this.showErr(); } });
    }
  }

  private showErr() { const e = this.store.error(); if (e) { this.snack.open(e, 'Dismiss', { duration: 5000 }); this.store.clearError(); } }
}
