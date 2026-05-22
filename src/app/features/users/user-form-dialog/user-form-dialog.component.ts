import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule } from '@ngx-translate/core';
import { UserDto, CreateUserRequestDto, UpdateUserRequestDto } from '@babakmirghafari/asms-api-client';

export interface UserFormDialogData {
  user?: UserDto;
  isEdit: boolean;
}

export type UserFormResult = CreateUserRequestDto | UpdateUserRequestDto;

@Component({
  selector: 'asms-user-form-dialog',
  templateUrl: './user-form-dialog.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatIconModule,
    MatStepperModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    TranslateModule
  ]
})
export class UserFormDialogComponent {
  readonly data: UserFormDialogData = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<UserFormDialogComponent>);
  private readonly fb = inject(FormBuilder);

  isLoading = false;

  readonly deliveryOptions = [
    { value: 'email', label: 'Email' },
    { value: 'sms', label: 'SMS' },
    { value: 'both', label: 'Email + SMS' },
    { value: 'manual', label: 'Manual (copy)' }
  ];

  readonly weekdays = [
    { value: 'MONDAY', label: 'Mon' },
    { value: 'TUESDAY', label: 'Tue' },
    { value: 'WEDNESDAY', label: 'Wed' },
    { value: 'THURSDAY', label: 'Thu' },
    { value: 'FRIDAY', label: 'Fri' },
    { value: 'SATURDAY', label: 'Sat' },
    { value: 'SUNDAY', label: 'Sun' }
  ];

  readonly selectedWorkdays: boolean[] = (() => {
    const existing = this.data.user?.workdays ?? [];
    return this.weekdays.map(d => existing.includes(d.value as CreateUserRequestDto.WorkdaysEnum));
  })();

  // Step 1 — Identity
  readonly identityForm = this.fb.group({
    username: [this.data.user?.username ?? '', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-z0-9._-]+$/)]],
    email: [this.data.user?.email ?? '', [Validators.required, Validators.email]],
    fullName: [this.data.user?.fullName ?? '', [Validators.required, Validators.minLength(2)]],
    phoneNumber: [this.data.user?.phoneNumber ?? ''],
    department: [this.data.user?.department ?? '']
  });

  // Step 2 — Password & delivery (create only)
  readonly passwordForm = this.fb.group({
    sendTempPassword: [true],
    deliveryMethod: ['email'],
    forcePasswordChange: [true],
    requireMfa: [false]
  });

  // Step 3 — Organization & station
  readonly orgForm = this.fb.group({
    organizationIds: [''],   // comma-separated org IDs
    ipRestriction: [this.data.user?.ipRestriction ?? ''],
    workStartTime: [this.data.user?.workHours?.start ?? '08:00'],
    workEndTime: [this.data.user?.workHours?.end ?? '18:00']
  });

  toggleWorkday(index: number): void {
    this.selectedWorkdays[index] = !this.selectedWorkdays[index];
  }

  cancel(): void {
    this.dialogRef.close(null);
  }

  submit(): void {
    if (this.identityForm.invalid) {
      this.identityForm.markAllAsTouched();
      return;
    }

    if (this.data.isEdit) {
      const nameParts = (this.identityForm.value.fullName ?? '').trim().split(' ');
      const dto: UpdateUserRequestDto = {
        email: this.identityForm.value.email!,
        firstName: nameParts[0] ?? '',
        lastName: nameParts.slice(1).join(' ') || nameParts[0],
        phoneNumber: this.identityForm.value.phoneNumber ?? undefined
      };
      this.dialogRef.close(dto);
    } else {
      const orgIdsRaw = this.orgForm.value.organizationIds?.trim();
      const organizationIds = orgIdsRaw
        ? orgIdsRaw.split(',').map(id => id.trim()).filter(Boolean)
        : undefined;

      const workdayValues = this.weekdays
        .filter((_, i) => this.selectedWorkdays[i])
        .map(d => d.value as CreateUserRequestDto.WorkdaysEnum);

      const dto: CreateUserRequestDto = {
        username: this.identityForm.value.username!,
        email: this.identityForm.value.email!,
        fullName: this.identityForm.value.fullName ?? undefined,
        phoneNumber: this.identityForm.value.phoneNumber ?? undefined,
        department: this.identityForm.value.department ?? undefined,
        organizationIds,
        workdays: workdayValues.length ? workdayValues : undefined,
        ipRestriction: this.orgForm.value.ipRestriction?.trim() || undefined,
        workHours: (this.orgForm.value.workStartTime && this.orgForm.value.workEndTime)
          ? { start: this.orgForm.value.workStartTime, end: this.orgForm.value.workEndTime }
          : undefined,
        sendTempPassword: this.passwordForm.value.sendTempPassword ?? false
      };
      this.dialogRef.close(dto);
    }
  }
}
