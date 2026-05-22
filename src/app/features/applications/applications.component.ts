import { Component, OnInit, inject } from '@angular/core';
import { DatePipe, SlicePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { debounceTime } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApplicationsStore } from './applications.store';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusChipComponent } from '../../shared/components/status-chip/status-chip.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { AppFormDialogComponent, AppFormDialogData, AppFormResult } from './app-form-dialog/app-form-dialog.component';
import { ApplicationDto, CreateApplicationRequestDto, UpdateApplicationRequestDto } from '@babakmirghafari/asms-api-client';

@Component({
  selector: 'asms-applications',
  templateUrl: './applications.component.html',
  styleUrl: './applications.component.scss',
  standalone: true,
  imports: [
    DatePipe, SlicePipe,
    ReactiveFormsModule,
    MatTableModule, MatButtonModule, MatIconModule, MatMenuModule,
    MatFormFieldModule, MatInputModule,
    MatProgressSpinnerModule, MatPaginatorModule, MatDividerModule,
    TranslateModule,
    PageHeaderComponent, StatusChipComponent
  ]
})
export class ApplicationsComponent implements OnInit {
  protected readonly store = inject(ApplicationsStore);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);
  private readonly fb = inject(FormBuilder);

  readonly displayedColumns = ['name', 'description', 'connectorType', 'status', 'createdAt', 'actions'];
  readonly searchCtrl = this.fb.control('');

  constructor() {
    this.searchCtrl.valueChanges.pipe(
      debounceTime(300),
      takeUntilDestroyed()
    ).subscribe(() => this.store.loadAll(0, 20));
  }

  ngOnInit(): void {
    this.store.loadAll();
  }

  onPage(event: PageEvent): void {
    this.store.loadAll(event.pageIndex, event.pageSize);
  }

  openCreateDialog(): void {
    const data: AppFormDialogData = { isEdit: false };
    this.dialog
      .open(AppFormDialogComponent, { data, width: '560px', disableClose: true })
      .afterClosed()
      .subscribe((result: AppFormResult | null) => {
        if (!result) return;
        this.store.create(result as CreateApplicationRequestDto).then(() => {
          this.snackBar.open(
            this.translate.instant('APPLICATIONS.CREATED_SUCCESS'),
            this.translate.instant('COMMON.CLOSE'),
            { duration: 4000, panelClass: 'snackbar-success' }
          );
        });
      });
  }

  openEditDialog(app: ApplicationDto): void {
    const data: AppFormDialogData = { app, isEdit: true };
    this.dialog
      .open(AppFormDialogComponent, { data, width: '560px', disableClose: true })
      .afterClosed()
      .subscribe((result: AppFormResult | null) => {
        if (!result) return;
        this.store.update(app.id, result as UpdateApplicationRequestDto).then(() => {
          this.snackBar.open(
            this.translate.instant('APPLICATIONS.UPDATED_SUCCESS'),
            this.translate.instant('COMMON.CLOSE'),
            { duration: 4000, panelClass: 'snackbar-success' }
          );
        });
      });
  }

  confirmDelete(app: ApplicationDto): void {
    const data: ConfirmDialogData = {
      titleKey: 'APPLICATIONS.DELETE_TITLE',
      messageKey: 'APPLICATIONS.DELETE_CONFIRM',
      messageParams: { name: app.name },
      dangerous: true,
      confirmKey: 'COMMON.DELETE'
    };
    this.dialog.open(ConfirmDialogComponent, { data }).afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.store.delete(app.id).then(() => {
          this.snackBar.open(
            this.translate.instant('APPLICATIONS.DELETED_SUCCESS'),
            this.translate.instant('COMMON.CLOSE'),
            { duration: 3000, panelClass: 'snackbar-success' }
          );
        });
      }
    });
  }
}
