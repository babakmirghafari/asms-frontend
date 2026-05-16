import {
  Component, Input, Output, EventEmitter, ChangeDetectionStrategy,
  computed, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { StatusChipComponent } from '../status-chip/status-chip.component';

export interface ColumnDef<T> {
  key: keyof T & string;
  label: string;
  type?: 'text' | 'status' | 'date' | 'actions' | 'badge';
  statusMap?: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'critical'>;
  sortable?: boolean;
}

export interface TableAction {
  label: string;
  icon?: string;
  color?: string;
  action: string;
}

@Component({
  selector: 'asms-data-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    StatusChipComponent,
  ],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableComponent<T extends { id: string }> {
  @Input() columns: ColumnDef<T>[] = [];
  @Input() data: T[] = [];
  @Input() loading = false;
  @Input() totalCount = 0;
  @Input() pageSize = 20;
  @Input() pageIndex = 0;
  @Input() actions: TableAction[] = [];
  @Input() emptyMessage = 'No records found';
  @Input() emptyIcon = 'inbox';

  @Output() pageChange = new EventEmitter<PageEvent>();
  @Output() sortChange = new EventEmitter<Sort>();
  @Output() actionClick = new EventEmitter<{ action: string; row: T }>();
  @Output() rowClick = new EventEmitter<T>();

  get displayedColumns(): string[] {
    const cols: string[] = this.columns.map(c => c.key as string);
    if (this.actions.length > 0) cols.push('_actions');
    return cols;
  }

  getCellValue(row: T, col: ColumnDef<T>): unknown {
    return row[col.key as keyof T];
  }

  onAction(action: string, row: T, event: Event): void {
    event.stopPropagation();
    this.actionClick.emit({ action, row });
  }
}
