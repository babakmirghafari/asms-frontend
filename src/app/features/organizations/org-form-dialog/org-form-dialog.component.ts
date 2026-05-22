import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { OrganizationDto, CreateOrganizationRequestDto } from '@babakmirghafari/asms-api-client';

export interface OrgFormDialogData {
  org?: OrganizationDto;
  isEdit: boolean;
}

@Component({
  selector: 'asms-org-form-dialog',
  templateUrl: './org-form-dialog.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslateModule
  ]
})
export class OrgFormDialogComponent {
  readonly data: OrgFormDialogData = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<OrgFormDialogComponent>);
  private readonly fb = inject(FormBuilder);

  isLoading = false;

  readonly form = this.fb.group({
    name: [this.data.org?.name ?? '', [Validators.required, Validators.minLength(2)]],
    description: [this.data.org?.description ?? ''],
    parentOrganizationId: ['']
  });

  cancel(): void {
    this.dialogRef.close(null);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const dto: CreateOrganizationRequestDto = {
      name: this.form.value.name!,
      description: this.form.value.description ?? undefined,
      parentOrganizationId: this.form.value.parentOrganizationId ?? undefined
    };

    this.dialogRef.close(dto);
  }
}
