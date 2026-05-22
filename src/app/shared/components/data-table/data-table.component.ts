import { Component, Input, Output, EventEmitter, ContentChildren, QueryList } from '@angular/core';
import { MatTableModule, MatColumnDef } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'asms-data-table',
  templateUrl: './data-table.component.html',
  styleUrl: './data-table.component.scss',
  standalone: true,
  imports: [MatTableModule, MatPaginatorModule, MatSortModule, MatProgressSpinnerModule, TranslateModule]
})
export class DataTableComponent {
  @Input() columns: string[] = [];
  @Input() data: unknown[] = [];
  @Input() loading = false;
  @Input() totalElements = 0;
  @Input() pageSize = 20;
  @Input() pageIndex = 0;
  @Output() pageChanged = new EventEmitter<PageEvent>();
  @Output() sortChanged = new EventEmitter<Sort>();

  @ContentChildren(MatColumnDef) columnDefs!: QueryList<MatColumnDef>;
}
