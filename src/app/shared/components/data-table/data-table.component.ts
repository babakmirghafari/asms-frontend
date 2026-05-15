import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ColumnDef<T> {
  key: keyof T;
  label: string;
  type?: 'text' | 'status' | 'date' | 'actions';
}

@Component({
  selector: 'asms-data-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableComponent<T extends { id: string }> {
  @Input() columns: ColumnDef<T>[] = [];
  @Input() data: T[] = [];
  @Input() loading = false;
  @Input() totalCount = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Output() pageChange = new EventEmitter<any>();
  @Output() actionClick = new EventEmitter<{ action: string; row: T }>();

  // TODO(angular-logic-implementer): add MatTableModule, MatPaginatorModule, MatSortModule imports
  // and implement sortable, filterable, paginated, bulk-selectable data table
}
