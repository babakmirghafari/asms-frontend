import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { StationPolicyDto, CreateStationPolicyRequestDto } from '@babakmirghafari/asms-api-client';
import { StationPoliciesStore } from './station-policies.store';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { DataTableComponent, ColumnDef, TableAction } from '../../shared/components/data-table/data-table.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog.component';

const STATUS_MAP: Record<string, 'success' | 'neutral' | 'danger'> = { ACTIVE: 'success', INACTIVE: 'neutral' };
const COLS: ColumnDef<StationPolicyDto>[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'status', label: 'Status', type: 'status', statusMap: STATUS_MAP },
  { key: 'workStartTime', label: 'Work Start' },
  { key: 'workEndTime', label: 'Work End' },
  { key: 'createdAt', label: 'Created', type: 'date', sortable: true },
];
const ACTIONS: TableAction[] = [
  { action: 'edit', label: 'Edit', icon: 'edit' },
  { action: 'delete', label: 'Delete', icon: 'delete', color: 'var(--color-danger)' },
];

@Component({
  selector: 'asms-station-policies',
  standalone: true,
  imports: [ReactiveFormsModule, MatSnackBarModule, PageHeaderComponent, DataTableComponent],
  providers: [StationPoliciesStore],
  templateUrl: './station-policies.component.html',
  styleUrl: './station-policies.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StationPoliciesComponent implements OnInit {
  readonly store = inject(StationPoliciesStore);
  private dialog = inject(MatDialog);
  private snack  = inject(MatSnackBar);
  private fb     = inject(FormBuilder);
  readonly columns = COLS; readonly actions = ACTIONS;
  form = this.fb.group({ name: ['', Validators.required], description: [''], organizationId: ['default'] });

  async ngOnInit() { await this.store.load(); this.showErr(); }
  async onPage(e: PageEvent) { this.store.setPage(e.pageIndex, e.pageSize); await this.store.load(); }

  async onAction(ev: { action: string; row: StationPolicyDto }) {
    if (ev.action === 'delete') {
      const ref = this.dialog.open(ConfirmDialogComponent, { data: { title: 'Delete Station Policy', message: `Delete "${ev.row.name}"?`, confirmLabel: 'Delete', danger: true } as ConfirmDialogData, width: '400px' });
      ref.afterClosed().subscribe(async (ok) => { if (ok) { const r = await this.store.remove(ev.row.id); if (r) this.snack.open('Deleted', 'Close', { duration: 3000 }); else this.showErr(); } });
    }
  }

  openCreate() {
    this.form.reset({ organizationId: 'default' });
    import('../../shared/components/form-dialog/form-dialog.component').then(({ FormDialogComponent }) => {
      const ref = this.dialog.open(FormDialogComponent, { data: { title: 'New Station Policy' }, width: '480px' });
      ref.afterClosed().subscribe(async (r) => { if (r === 'submit' && this.form.valid) { const ok = await this.store.create(this.form.value as CreateStationPolicyRequestDto); if (ok) { this.snack.open('Created', 'Close', { duration: 3000 }); await this.store.load(); } else this.showErr(); } });
    });
  }

  private showErr() { const e = this.store.error(); if (e) { this.snack.open(e, 'Dismiss', { duration: 5000 }); this.store.clearError(); } }
}
