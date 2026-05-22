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
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PermissionGroupsStore } from './permission-groups.store';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusChipComponent } from '../../shared/components/status-chip/status-chip.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { PgFormDialogComponent, PgFormDialogData } from './pg-form-dialog/pg-form-dialog.component';
import { PermissionGroupDto, CreatePermissionGroupRequestDto, UpdatePermissionGroupRequestDto } from '@babakmirghafari/asms-api-client';

@Component({
  selector: 'asms-permission-groups',
  templateUrl: './permission-groups.component.html',
  styleUrl: './permission-groups.component.scss',
  standalone: true,
  imports: [
    DatePipe, SlicePipe,
    ReactiveFormsModule,
    MatTableModule, MatButtonModule, MatIconModule, MatMenuModule,
    MatFormFieldModule, MatInputModule,
    MatProgressSpinnerModule, MatPaginatorModule, MatDividerModule, MatTooltipModule,
    TranslateModule,
    PageHeaderComponent, StatusChipComponent
  ]
})
export class PermissionGroupsComponent implements OnInit {
  protected readonly store = inject(PermissionGroupsStore);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);
  private readonly fb = inject(FormBuilder);

  readonly displayedColumns = ['name', 'description', 'memberCount', 'permissionCount', 'status', 'actions'];
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
    const data: PgFormDialogData = { isEdit: false };
    this.dialog
      .open(PgFormDialogComponent, { data, width: '560px', disableClose: true })
      .afterClosed()
      .subscribe((dto: CreatePermissionGroupRequestDto | null) => {
        if (!dto) return;
        this.store.create(dto).then(() => {
          this.snackBar.open(
            this.translate.instant('PERMISSION_GROUPS.CREATED_SUCCESS'),
            this.translate.instant('COMMON.CLOSE'),
            { duration: 4000, panelClass: 'snackbar-success' }
          );
        });
      });
  }

  openEditDialog(group: PermissionGroupDto): void {
    const data: PgFormDialogData = { group, isEdit: true };
    this.dialog
      .open(PgFormDialogComponent, { data, width: '560px', disableClose: true })
      .afterClosed()
      .subscribe((dto: CreatePermissionGroupRequestDto | null) => {
        if (!dto) return;
        const updateDto: UpdatePermissionGroupRequestDto = {
          name: dto.name,
          description: dto.description
        };
        this.store.update(group.id, updateDto).then(() => {
          this.snackBar.open(
            this.translate.instant('PERMISSION_GROUPS.UPDATED_SUCCESS'),
            this.translate.instant('COMMON.CLOSE'),
            { duration: 4000, panelClass: 'snackbar-success' }
          );
        });
      });
  }

  confirmDelete(group: PermissionGroupDto): void {
    const data: ConfirmDialogData = {
      titleKey: 'PERMISSION_GROUPS.DELETE_TITLE',
      messageKey: 'PERMISSION_GROUPS.DELETE_CONFIRM',
      messageParams: { name: group.name },
      dangerous: true,
      confirmKey: 'COMMON.DELETE'
    };
    this.dialog.open(ConfirmDialogComponent, { data, width: '440px' }).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.store.delete(group.id).then(() => {
        this.snackBar.open(
          this.translate.instant('PERMISSION_GROUPS.DELETED_SUCCESS'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 4000, panelClass: 'snackbar-success' }
        );
      });
    });
  }
}
