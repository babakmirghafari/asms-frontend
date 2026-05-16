import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApplicationDto, CreateApplicationRequestDto } from '@babakmirghafari/asms-api-client';
import { ApplicationsStore } from './applications.store';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { DataTableComponent, ColumnDef, TableAction } from '../../shared/components/data-table/data-table.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog.component';

const STATUS_MAP: Record<string, 'success' | 'neutral' | 'danger'> = { ACTIVE: 'success', INACTIVE: 'neutral', SUSPENDED: 'danger' };
const COLS: ColumnDef<ApplicationDto>[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'connectorType', label: 'Type' },
  { key: 'status', label: 'Status', type: 'status', statusMap: STATUS_MAP },
  { key: 'clientId', label: 'Client ID' },
  { key: 'lastUsedAt', label: 'Last Used', type: 'date', sortable: true },
];
const ACTIONS: TableAction[] = [
  { action: 'edit', label: 'Edit', icon: 'edit' },
  { action: 'delete', label: 'Delete', icon: 'delete', color: 'var(--color-danger)' },
];

@Component({
  selector: 'asms-applications',
  standalone: true,
  imports: [ReactiveFormsModule, MatSnackBarModule, PageHeaderComponent, DataTableComponent],
  providers: [ApplicationsStore],
  templateUrl: './applications.component.html',
  styleUrl: './applications.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ApplicationsComponent implements OnInit {
  readonly store = inject(ApplicationsStore);
  private dialog = inject(MatDialog);
  private snack  = inject(MatSnackBar);
  private fb     = inject(FormBuilder);
  readonly columns = COLS; readonly actions = ACTIONS;
  form = this.fb.group({ name: ['', Validators.required], connectorType: ['OIDC', Validators.required], organizationId: ['default'], description: [''] });

  async ngOnInit() { await this.store.load(); this.showErr(); }
  async onPage(e: PageEvent) { this.store.setPage(e.pageIndex, e.pageSize); await this.store.load(); }

  async onAction(ev: { action: string; row: ApplicationDto }) {
    if (ev.action === 'delete') {
      const ref = this.dialog.open(ConfirmDialogComponent, { data: { title: 'Delete Application', message: `Delete "${ev.row.name}"?`, confirmLabel: 'Delete', danger: true } as ConfirmDialogData, width: '400px' });
      ref.afterClosed().subscribe(async (ok) => { if (ok) { const r = await this.store.remove(ev.row.id); if (r) this.snack.open('Deleted', 'Close', { duration: 3000 }); else this.showErr(); } });
    }
  }

  openCreate() {
    this.form.reset({ connectorType: 'OIDC', organizationId: 'default' });
    import('../../shared/components/form-dialog/form-dialog.component').then(({ FormDialogComponent }) => {
      const ref = this.dialog.open(FormDialogComponent, { data: { title: 'New Application' }, width: '480px' });
      ref.afterClosed().subscribe(async (r) => { if (r === 'submit' && this.form.valid) { const ok = await this.store.create(this.form.value as CreateApplicationRequestDto); if (ok) { this.snack.open('Created', 'Close', { duration: 3000 }); await this.store.load(); } else this.showErr(); } });
    });
  }

  private showErr() { const e = this.store.error(); if (e) { this.snack.open(e, 'Dismiss', { duration: 5000 }); this.store.clearError(); } }
}
