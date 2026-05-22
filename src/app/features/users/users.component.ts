import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { debounceTime } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UsersStore } from './users.store';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusChipComponent } from '../../shared/components/status-chip/status-chip.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { UserFormDialogComponent, UserFormDialogData, UserFormResult } from './user-form-dialog/user-form-dialog.component';
import { UserDto, CreateUserRequestDto, UpdateUserRequestDto } from '@babakmirghafari/asms-api-client';

@Component({
  selector: 'asms-users',
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatTableModule, MatButtonModule, MatIconModule, MatMenuModule,
    MatFormFieldModule, MatInputModule, MatProgressSpinnerModule, MatPaginatorModule,
    MatDividerModule, MatTooltipModule,
    TranslateModule,
    PageHeaderComponent, StatusChipComponent
  ]
})
export class UsersComponent implements OnInit {
  protected readonly store = inject(UsersStore);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);
  private readonly fb = inject(FormBuilder);

  readonly displayedColumns = ['fullName', 'username', 'email', 'status', 'mfaEnabled', 'lastLoginAt', 'actions'];
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
    const data: UserFormDialogData = { isEdit: false };
    this.dialog
      .open(UserFormDialogComponent, { data, width: '640px', disableClose: true })
      .afterClosed()
      .subscribe((result: UserFormResult | null) => {
        if (!result) return;
        this.store.create(result as CreateUserRequestDto).then(() => {
          this.snackBar.open(
            this.translate.instant('USERS.CREATED_SUCCESS'),
            this.translate.instant('COMMON.CLOSE'),
            { duration: 4000, panelClass: 'snackbar-success' }
          );
        });
      });
  }

  openEditDialog(user: UserDto): void {
    const data: UserFormDialogData = { user, isEdit: true };
    this.dialog
      .open(UserFormDialogComponent, { data, width: '640px', disableClose: true })
      .afterClosed()
      .subscribe((result: UserFormResult | null) => {
        if (!result) return;
        this.store.update(user.id, result as UpdateUserRequestDto).then(() => {
          this.snackBar.open(
            this.translate.instant('USERS.UPDATED_SUCCESS'),
            this.translate.instant('COMMON.CLOSE'),
            { duration: 4000, panelClass: 'snackbar-success' }
          );
        });
      });
  }

  confirmDelete(user: UserDto): void {
    const data: ConfirmDialogData = {
      titleKey: 'USERS.DELETE_TITLE',
      messageKey: 'USERS.DELETE_CONFIRM',
      messageParams: { name: user.username },
      dangerous: true,
      confirmKey: 'COMMON.DELETE'
    };
    this.dialog.open(ConfirmDialogComponent, { data, width: '440px' }).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.store.delete(user.id).then(() => {
        this.snackBar.open(
          this.translate.instant('USERS.DELETED_SUCCESS'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 4000, panelClass: 'snackbar-success' }
        );
      });
    });
  }

  getMfaIcon(user: UserDto): string {
    return user.mfaEnabled ? 'verified_user' : 'shield';
  }

  getMfaClass(user: UserDto): string {
    return user.mfaEnabled ? 'icon-success' : 'icon-disabled';
  }

  getMfaTooltip(user: UserDto): string {
    return user.mfaEnabled ? 'MFA Enabled' : 'MFA Disabled';
  }
}
