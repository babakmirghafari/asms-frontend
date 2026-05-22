import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { debounceTime } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PermissionsStore } from './permissions.store';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusChipComponent } from '../../shared/components/status-chip/status-chip.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import {
  PermissionFormDialogComponent,
  PermissionFormDialogData
} from './permission-form-dialog/permission-form-dialog.component';
import { PermissionDto, CreatePermissionRequestDto } from '@babakmirghafari/asms-api-client';

@Component({
  selector: 'asms-permissions',
  templateUrl: './permissions.component.html',
  styleUrl: './permissions.component.scss',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatTableModule, MatButtonModule, MatIconModule, MatMenuModule,
    MatFormFieldModule, MatInputModule,
    MatProgressSpinnerModule, MatPaginatorModule,
    TranslateModule,
    PageHeaderComponent, StatusChipComponent
  ]
})
export class PermissionsComponent implements OnInit {
  protected readonly store = inject(PermissionsStore);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);
  private readonly fb = inject(FormBuilder);

  readonly displayedColumns = ['name', 'resource', 'action', 'status', 'createdAt', 'actions'];
  readonly searchCtrl = this.fb.control('');

  constructor() {
    this.searchCtrl.valueChanges.pipe(
      debounceTime(300),
      takeUntilDestroyed()
    ).subscribe(q => this.store.loadAll(0, 20, q ?? undefined));
  }

  ngOnInit(): void {
    this.store.loadAll();
  }

  onPage(event: PageEvent): void {
    this.store.loadAll(event.pageIndex, event.pageSize, this.searchCtrl.value ?? undefined);
  }

  openCreateDialog(): void {
    const data: PermissionFormDialogData = {};
    this.dialog
      .open(PermissionFormDialogComponent, { data, width: '520px', disableClose: true })
      .afterClosed()
      .subscribe((result: CreatePermissionRequestDto | null) => {
        if (!result) return;
        this.store.create(result).then(() => {
          this.snackBar.open(
            this.translate.instant('PERMISSIONS.CREATED_SUCCESS'),
            this.translate.instant('COMMON.CLOSE'),
            { duration: 4000, panelClass: 'snackbar-success' }
          );
        });
      });
  }

  confirmDelete(permission: PermissionDto): void {
    const data: ConfirmDialogData = {
      titleKey: 'PERMISSIONS.DELETE_TITLE',
      messageKey: 'PERMISSIONS.DELETE_CONFIRM',
      dangerous: true,
      confirmKey: 'COMMON.DELETE'
    };
    this.dialog.open(ConfirmDialogComponent, { data }).afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.store.delete(permission.id).then(() => {
          this.snackBar.open(
            this.translate.instant('PERMISSIONS.DELETED_SUCCESS'),
            this.translate.instant('COMMON.CLOSE'),
            { duration: 3000, panelClass: 'snackbar-success' }
          );
        });
      }
    });
  }
}
