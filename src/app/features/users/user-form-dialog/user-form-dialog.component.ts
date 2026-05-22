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

  // Identity step — match CreateUserRequestDto fields
  readonly identityForm = this.fb.group({
    username: [this.data.user?.username ?? '', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-z0-9._-]+$/)]],
    email: [this.data.user?.email ?? '', [Validators.required, Validators.email]],
    fullName: [this.data.user?.fullName ?? '', [Validators.required, Validators.minLength(2)]],
    phoneNumber: [this.data.user?.phoneNumber ?? ''],
    department: [this.data.user?.department ?? '']
  });

  // Settings step
  readonly settingsForm = this.fb.group({
    sendTempPassword: [!this.data.isEdit],
    mfaEnabled: [this.data.user?.mfaEnabled ?? false]
  });

  cancel(): void {
    this.dialogRef.close(null);
  }

  submit(): void {
    if (this.identityForm.invalid) {
      this.identityForm.markAllAsTouched();
      return;
    }

    if (this.data.isEdit) {
      // UpdateUserRequestDto requires email, firstName, lastName
      const nameParts = (this.identityForm.value.fullName ?? '').trim().split(' ');
      const dto: UpdateUserRequestDto = {
        email: this.identityForm.value.email!,
        firstName: nameParts[0] ?? '',
        lastName: nameParts.slice(1).join(' ') || nameParts[0],
        phoneNumber: this.identityForm.value.phoneNumber ?? undefined
      };
      this.dialogRef.close(dto);
    } else {
      const dto: CreateUserRequestDto = {
        username: this.identityForm.value.username!,
        email: this.identityForm.value.email!,
        fullName: this.identityForm.value.fullName ?? undefined,
        phoneNumber: this.identityForm.value.phoneNumber ?? undefined,
        department: this.identityForm.value.department ?? undefined,
        sendTempPassword: this.settingsForm.value.sendTempPassword ?? false
      };
      this.dialogRef.close(dto);
    }
  }
}
