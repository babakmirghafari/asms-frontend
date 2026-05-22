import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { TranslateModule } from '@ngx-translate/core';
import { ActivityLogsStore } from './activity-logs.store';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ActivityLogDto } from '@babakmirghafari/asms-api-client';

@Component({
  selector: 'asms-activity-logs',
  templateUrl: './activity-logs.component.html',
  styleUrl: './activity-logs.component.scss',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatTableModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatSelectModule, MatProgressSpinnerModule, MatPaginatorModule,
    TranslateModule,
    PageHeaderComponent
  ]
})
export class ActivityLogsComponent implements OnInit {
  protected readonly store = inject(ActivityLogsStore);
  private readonly fb = inject(FormBuilder);

  readonly displayedColumns = ['timestamp', 'actorUsername', 'eventType', 'targetDisplayName', 'outcome', 'ipAddress'];
  readonly categoryCtrl = this.fb.control('');
  readonly categories = Object.values(ActivityLogDto.CategoryEnum);

  ngOnInit(): void {
    this.store.loadAll();
    this.categoryCtrl.valueChanges.subscribe(v => {
      this.store.loadAll(0, 20, v as ActivityLogDto.CategoryEnum || undefined);
    });
  }

  onPage(event: PageEvent): void {
    this.store.loadAll(event.pageIndex, event.pageSize, this.categoryCtrl.value as ActivityLogDto.CategoryEnum || undefined);
  }
}
