import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { TranslateModule } from '@ngx-translate/core';
import { debounceTime } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuditLogsStore } from './audit-logs.store';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'asms-audit-logs',
  templateUrl: './audit-logs.component.html',
  styleUrl: './audit-logs.component.scss',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatProgressSpinnerModule, MatPaginatorModule,
    TranslateModule,
    PageHeaderComponent
  ]
})
export class AuditLogsComponent implements OnInit {
  protected readonly store = inject(AuditLogsStore);
  private readonly fb = inject(FormBuilder);

  readonly displayedColumns = ['timestamp', 'eventType', 'actorUsername', 'targetType', 'outcome', 'ipAddress'];
  readonly eventTypeCtrl = this.fb.control('');

  constructor() {
    this.eventTypeCtrl.valueChanges.pipe(
      debounceTime(400),
      takeUntilDestroyed()
    ).subscribe(v => this.store.loadAll(0, 20, v ?? undefined));
  }

  ngOnInit(): void {
    this.store.loadAll();
  }

  onPage(event: PageEvent): void {
    this.store.loadAll(event.pageIndex, event.pageSize, this.eventTypeCtrl.value ?? undefined);
  }
}
