import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PageEvent } from '@angular/material/paginator';
import { UserDto, CreateUserRequestDto, UpdateUserRequestDto, UserStatusUpdateRequestDto } from '@babakmirghafari/asms-api-client';
import { UsersStore } from './users.store';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { DataTableComponent, ColumnDef, TableAction } from '../../shared/components/data-table/data-table.component';
import { SearchInputComponent } from '../../shared/components/search-input/search-input.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog.component';

const USER_STATUS_MAP: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
  ACTIVE: 'success',
  INACTIVE: 'neutral',
  LOCKED: 'danger',
  TEMP_PASSWORD: 'warning',
  PENDING_MFA_ENROLLMENT: 'info',
};

const COLUMNS: ColumnDef<UserDto>[] = [
  { key: 'username',    label: 'Username',   sortable: true },
  { key: 'displayName', label: 'Name',        sortable: true },
  { key: 'email',       label: 'Email',       sortable: true },
  { key: 'status',      label: 'Status',      type: 'status', statusMap: USER_STATUS_MAP },
  { key: 'lastLoginAt', label: 'Last Login',  type: 'date',   sortable: true },
  { key: 'createdAt',   label: 'Created',     type: 'date',   sortable: true },
];

const ACTIONS: TableAction[] = [
  { action: 'edit',   label: 'Edit',          icon: 'edit' },
  { action: 'lock',   label: 'Lock Account',  icon: 'lock',   color: 'var(--color-warning)' },
  { action: 'unlock', label: 'Unlock Account', icon: 'lock_open' },
  { action: 'delete', label: 'Delete',         icon: 'delete', color: 'var(--color-danger)' },
];

@Component({
  selector: 'asms-users',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    PageHeaderComponent,
    DataTableComponent,
    SearchInputComponent,
  ],
  providers: [UsersStore],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersComponent implements OnInit {
  readonly store  = inject(UsersStore);
  private dialog  = inject(MatDialog);
  private snack   = inject(MatSnackBar);
  private fb      = inject(FormBuilder);

  readonly columns = COLUMNS;
  readonly actions = ACTIONS;
  readonly statusOptions = Object.keys(USER_STATUS_MAP);

  userForm = this.fb.group({
    username:  ['', [Validators.required, Validators.minLength(3)]],
    email:     ['', [Validators.required, Validators.email]],
    firstName: ['', Validators.required],
    lastName:  ['', Validators.required],
    phoneNumber: [''],
  });

  async ngOnInit(): Promise<void> {
    await this.store.loadUsers();
    this.showError();
  }

  async onSearch(search: string): Promise<void> {
    this.store.setSearch(search);
    await this.store.loadUsers();
  }

  async onStatusFilter(status: string): Promise<void> {
    this.store.setStatusFilter(status);
    await this.store.loadUsers();
  }

  async onPageChange(event: PageEvent): Promise<void> {
    this.store.setPage(event.pageIndex, event.pageSize);
    await this.store.loadUsers();
  }

  async onAction(event: { action: string; row: UserDto }): Promise<void> {
    switch (event.action) {
      case 'delete': await this.confirmDelete(event.row); break;
      case 'lock':   await this.updateStatus(event.row.id, 'LOCKED'); break;
      case 'unlock': await this.updateStatus(event.row.id, 'ACTIVE'); break;
      case 'edit':   this.openEditDialog(event.row); break;
    }
  }

  openCreateDialog(): void {
    this.userForm.reset();
    import('../../shared/components/form-dialog/form-dialog.component').then(({ FormDialogComponent }) => {
      const ref = this.dialog.open(FormDialogComponent, {
        data: { title: 'Create User', submitLabel: 'Create' },
        width: '540px',
      });
      ref.afterClosed().subscribe(async (result) => {
        if (result === 'submit' && this.userForm.valid) {
          const dto: CreateUserRequestDto = this.userForm.value as CreateUserRequestDto;
          const user = await this.store.createUser(dto);
          if (user) {
            this.snack.open('User created successfully', 'Close', { duration: 3000 });
            await this.store.loadUsers();
          } else { this.showError(); }
        }
      });
    });
  }

  openEditDialog(user: UserDto): void {
    this.userForm.patchValue({
      username: user.username,
      email: user.email,
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      phoneNumber: user.phoneNumber ?? '',
    });
    import('../../shared/components/form-dialog/form-dialog.component').then(({ FormDialogComponent }) => {
      const ref = this.dialog.open(FormDialogComponent, {
        data: { title: 'Edit User', submitLabel: 'Save Changes' },
        width: '540px',
      });
      ref.afterClosed().subscribe(async (result) => {
        if (result === 'submit' && this.userForm.valid) {
          const updated = await this.store.updateUser(user.id, this.userForm.value as UpdateUserRequestDto);
          if (updated) {
            this.snack.open('User updated', 'Close', { duration: 3000 });
          } else { this.showError(); }
        }
      });
    });
  }

  private async confirmDelete(user: UserDto): Promise<void> {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete User',
        message: `Are you sure you want to delete "${user.displayName ?? user.username}"? This action cannot be undone.`,
        confirmLabel: 'Delete',
        danger: true,
      } as ConfirmDialogData,
      width: '400px',
    });
    ref.afterClosed().subscribe(async (confirmed) => {
      if (confirmed) {
        const ok = await this.store.deleteUser(user.id);
        if (ok) { this.snack.open('User deleted', 'Close', { duration: 3000 }); }
        else { this.showError(); }
      }
    });
  }

  private async updateStatus(userId: string, status: string): Promise<void> {
    const ok = await this.store.updateStatus(userId, { status: status as UserStatusUpdateRequestDto.StatusEnum });
    if (ok) { this.snack.open(`User ${status.toLowerCase()}`, 'Close', { duration: 3000 }); }
    else { this.showError(); }
  }

  private showError(): void {
    const err = this.store.error();
    if (err) {
      this.snack.open(err, 'Dismiss', { duration: 5000, panelClass: 'snack-error' });
      this.store.clearError();
    }
  }
}
