import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { PermissionDto, CreatePermissionRequestDto } from '@babakmirghafari/asms-api-client';
import { PermissionsStore } from './permissions.store';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { DataTableComponent, ColumnDef, TableAction } from '../../shared/components/data-table/data-table.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog.component';

const COLS: ColumnDef<PermissionDto>[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'resource', label: 'Resource', sortable: true },
  { key: 'action', label: 'Action' },
  { key: 'status', label: 'Status', type: 'status', statusMap: { ACTIVE: 'success', INACTIVE: 'neutral', DEPRECATED: 'danger' } },
  { key: 'createdAt', label: 'Created', type: 'date', sortable: true },
];
const ACTIONS: TableAction[] = [{ action: 'delete', label: 'Delete', icon: 'delete', color: 'var(--color-danger)' }];

@Component({
  selector: 'asms-permissions',
  standalone: true,
  imports: [ReactiveFormsModule, MatInputModule, MatFormFieldModule, MatSnackBarModule, PageHeaderComponent, DataTableComponent],
  providers: [PermissionsStore],
  templateUrl: './permissions.component.html',
  styleUrl: './permissions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PermissionsComponent implements OnInit {
  readonly store = inject(PermissionsStore);
  private dialog = inject(MatDialog);
  private snack  = inject(MatSnackBar);
  private fb     = inject(FormBuilder);
  readonly columns = COLS; readonly actions = ACTIONS;
  form = this.fb.group({ name: ['', Validators.required], resource: ['', Validators.required], action: ['READ', Validators.required], organizationId: ['default'] });

  async ngOnInit() { await this.store.load(); this.showErr(); }
  async onPage(e: PageEvent) { this.store.setPage(e.pageIndex, e.pageSize); await this.store.load(); }

  async onAction(ev: { action: string; row: PermissionDto }) {
    if (ev.action === 'delete') {
      const ref = this.dialog.open(ConfirmDialogComponent, { data: { title: 'Delete Permission', message: `Delete "${ev.row.name}"?`, confirmLabel: 'Delete', danger: true } as ConfirmDialogData, width: '400px' });
      ref.afterClosed().subscribe(async (ok) => { if (ok) { const r = await this.store.remove(ev.row.id); if (r) this.snack.open('Deleted', 'Close', { duration: 3000 }); else this.showErr(); } });
    }
  }

  openCreate() {
    this.form.reset({ action: 'READ', organizationId: 'default' });
    import('../../shared/components/form-dialog/form-dialog.component').then(({ FormDialogComponent }) => {
      const ref = this.dialog.open(FormDialogComponent, { data: { title: 'New Permission' }, width: '480px' });
      ref.afterClosed().subscribe(async (r) => { if (r === 'submit' && this.form.valid) { const ok = await this.store.create(this.form.value as CreatePermissionRequestDto); if (ok) { this.snack.open('Created', 'Close', { duration: 3000 }); await this.store.load(); } else this.showErr(); } });
    });
  }

  private showErr() { const e = this.store.error(); if (e) { this.snack.open(e, 'Dismiss', { duration: 5000 }); this.store.clearError(); } }
}
