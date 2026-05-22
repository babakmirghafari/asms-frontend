import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { CreatePermissionRequestDto } from '@babakmirghafari/asms-api-client';

export interface PermissionFormDialogData {
  organizationId?: string;
}

@Component({
  selector: 'asms-permission-form-dialog',
  templateUrl: './permission-form-dialog.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    TranslateModule
  ]
})
export class PermissionFormDialogComponent {
  readonly data: PermissionFormDialogData = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<PermissionFormDialogComponent>);
  private readonly fb = inject(FormBuilder);

  isLoading = false;

  readonly actions = [
    { value: 'READ', label: 'READ — View and list resources' },
    { value: 'WRITE', label: 'WRITE — Create and update resources' },
    { value: 'DELETE', label: 'DELETE — Remove resources' },
    { value: 'ADMIN', label: 'ADMIN — Full administrative control' }
  ];

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.pattern(/^[a-z][a-z0-9._-]*$/)]], // e.g. corebanking.accounts.read
    description: [''],
    resource: ['', Validators.required],
    action: ['READ', Validators.required],
    organizationId: [this.data.organizationId ?? '', Validators.required]
  });

  cancel(): void {
    this.dialogRef.close(null);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const dto: CreatePermissionRequestDto = {
      name: this.form.value.name!,
      description: this.form.value.description ?? undefined,
      resource: this.form.value.resource!,
      action: this.form.value.action as CreatePermissionRequestDto.ActionEnum,
      organizationId: this.form.value.organizationId!
    };

    this.dialogRef.close(dto);
  }
}
