import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { AsmsModalComponent } from '../../../shared/components/modal/modal.component';
import { PermissionGroupDto, CreatePermissionGroupRequestDto } from '@babakmirghafari/asms-api-client';
import { AuthStore } from '../../../core/store/auth.store';

export interface PgFormDialogData {
  group?: PermissionGroupDto;
  isEdit: boolean;
}

@Component({
  selector: 'asms-pg-form-dialog',
  templateUrl: './pg-form-dialog.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslateModule,
    AsmsModalComponent
  ]
})
export class PgFormDialogComponent {
  readonly data: PgFormDialogData = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<PgFormDialogComponent>);
  private readonly fb = inject(FormBuilder);
  private readonly authStore = inject(AuthStore);

  isLoading = false;

  readonly form = this.fb.group({
    name: [this.data.group?.name ?? '', [Validators.required, Validators.minLength(2)]],
    description: [this.data.group?.description ?? ''],
    riskLevel: ['LOW', Validators.required]
  });

  readonly riskOptions = [
    { value: 'LOW', labelKey: 'DASHBOARD.LOW' },
    { value: 'MEDIUM', labelKey: 'DASHBOARD.MEDIUM' },
    { value: 'HIGH', labelKey: 'DASHBOARD.HIGH' },
    { value: 'CRITICAL', labelKey: 'DASHBOARD.CRITICAL' }
  ];

  get isHighRisk(): boolean {
    const r = this.form.get('riskLevel')?.value;
    return r === 'HIGH' || r === 'CRITICAL';
  }

  cancel(): void {
    this.dialogRef.close(null);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // organizationId is required by the DTO — use current session's org or a default
    const organizationId = this.authStore.organizationId() ?? 'default';

    const dto: CreatePermissionGroupRequestDto = {
      name: this.form.value.name!,
      description: this.form.value.description ?? undefined,
      organizationId
    };

    this.dialogRef.close(dto);
  }
}
