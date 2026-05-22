import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { AsmsModalComponent } from '../../../shared/components/modal/modal.component';
import { CreateMembershipRequestDto } from '@babakmirghafari/asms-api-client';

export interface MembershipFormDialogData {
  userId?: string;
  organizationId?: string;
}

@Component({
  selector: 'asms-membership-form-dialog',
  templateUrl: './membership-form-dialog.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslateModule,
    AsmsModalComponent
  ]
})
export class MembershipFormDialogComponent {
  readonly data: MembershipFormDialogData = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<MembershipFormDialogComponent>);
  private readonly fb = inject(FormBuilder);

  isLoading = false;

  readonly form = this.fb.group({
    userId: [this.data.userId ?? '', Validators.required],
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

    const dto: CreateMembershipRequestDto = {
      userId: this.form.value.userId!,
      organizationId: this.form.value.organizationId!
    };

    this.dialogRef.close(dto);
  }
}
