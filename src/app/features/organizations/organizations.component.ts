import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { OrganizationDto, CreateOrganizationRequestDto } from '@babakmirghafari/asms-api-client';
import { OrganizationsStore } from './organizations.store';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { DataTableComponent, ColumnDef, TableAction } from '../../shared/components/data-table/data-table.component';
import { SearchInputComponent } from '../../shared/components/search-input/search-input.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog.component';

const STATUS_MAP: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = { ACTIVE: 'success', INACTIVE: 'neutral', SUSPENDED: 'danger' };
const COLS: ColumnDef<OrganizationDto>[] = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'status', label: 'Status', type: 'status', statusMap: STATUS_MAP },
  { key: 'createdAt', label: 'Created', type: 'date', sortable: true },
];
const ACTIONS: TableAction[] = [
  { action: 'edit', label: 'Edit', icon: 'edit' },
  { action: 'delete', label: 'Delete', icon: 'delete', color: 'var(--color-danger)' },
];

@Component({
  selector: 'asms-organizations',
  standalone: true,
  imports: [ReactiveFormsModule, MatSelectModule, MatFormFieldModule, MatButtonModule, MatSnackBarModule, PageHeaderComponent, DataTableComponent, SearchInputComponent],
  providers: [OrganizationsStore],
  templateUrl: './organizations.component.html',
  styleUrl: './organizations.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizationsComponent implements OnInit {
  readonly store = inject(OrganizationsStore);
  private dialog = inject(MatDialog);
  private snack  = inject(MatSnackBar);
  private fb     = inject(FormBuilder);
  readonly columns = COLS; readonly actions = ACTIONS;
  form = this.fb.group({ name: ['', Validators.required], description: [''] });

  async ngOnInit() { await this.store.load(); this.showErr(); }
  async onSearch(s: string) { this.store.setStatusFilter(s); await this.store.load(); }
  async onPage(e: PageEvent) { this.store.setPage(e.pageIndex, e.pageSize); await this.store.load(); }

  async onAction(ev: { action: string; row: OrganizationDto }) {
    if (ev.action === 'delete') {
      const ref = this.dialog.open(ConfirmDialogComponent, { data: { title: 'Delete Organization', message: `Delete "${ev.row.name}"?`, confirmLabel: 'Delete', danger: true } as ConfirmDialogData, width: '400px' });
      ref.afterClosed().subscribe(async (ok) => { if (ok) { const r = await this.store.remove(ev.row.id); if (r) this.snack.open('Deleted', 'Close', { duration: 3000 }); else this.showErr(); } });
    }
  }

  openCreate() {
    this.form.reset();
    import('../../shared/components/form-dialog/form-dialog.component').then(({ FormDialogComponent }) => {
      const ref = this.dialog.open(FormDialogComponent, { data: { title: 'New Organization' }, width: '480px' });
      ref.afterClosed().subscribe(async (r) => { if (r === 'submit' && this.form.valid) { const ok = await this.store.create(this.form.value as CreateOrganizationRequestDto); if (ok) { this.snack.open('Created', 'Close', { duration: 3000 }); await this.store.load(); } else this.showErr(); } });
    });
  }

  private showErr() { const e = this.store.error(); if (e) { this.snack.open(e, 'Dismiss', { duration: 5000 }); this.store.clearError(); } }
}
