import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { AsmsModalComponent } from '../../../shared/components/modal/modal.component';
import {
  ApplicationDto,
  CreateApplicationRequestDto,
  UpdateApplicationRequestDto
} from '@babakmirghafari/asms-api-client';

export interface AppFormDialogData {
  app?: ApplicationDto;
  isEdit: boolean;
}

export type AppFormResult = CreateApplicationRequestDto | UpdateApplicationRequestDto;

@Component({
  selector: 'asms-app-form-dialog',
  templateUrl: './app-form-dialog.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    TranslateModule,
    AsmsModalComponent
  ]
})
export class AppFormDialogComponent {
  readonly data: AppFormDialogData = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<AppFormDialogComponent>);
  private readonly fb = inject(FormBuilder);

  isLoading = false;

  readonly connectorTypes = [
    { value: 'OIDC', label: 'OIDC (OpenID Connect)' },
    { value: 'SAML', label: 'SAML 2.0' },
    { value: 'API_TOKEN', label: 'API Token' }
  ];

  readonly form = this.fb.group({
    name: [this.data.app?.name ?? '', [Validators.required, Validators.minLength(2)]],
    description: [this.data.app?.description ?? ''],
    connectorType: [
      this.data.app?.connectorType ?? 'OIDC',
      Validators.required
    ],
    organizationId: [
      '',
      this.data.isEdit ? [] : [Validators.required]
    ],
    redirectUris: ['']
  });

  cancel(): void {
    this.dialogRef.close(null);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const redirectUrisRaw = this.form.value.redirectUris?.trim();
    const redirectUris = redirectUrisRaw
      ? redirectUrisRaw.split('\n').map(u => u.trim()).filter(Boolean)
      : undefined;

    if (this.data.isEdit) {
      const dto: UpdateApplicationRequestDto = {
        name: this.form.value.name!,
        description: this.form.value.description ?? undefined,
        connectorType: (this.data.app?.connectorType ?? 'OIDC') as UpdateApplicationRequestDto.ConnectorTypeEnum,
        redirectUris
      };
      this.dialogRef.close(dto);
    } else {
      const dto: CreateApplicationRequestDto = {
        name: this.form.value.name!,
        description: this.form.value.description ?? undefined,
        connectorType: this.form.value.connectorType as CreateApplicationRequestDto.ConnectorTypeEnum,
        organizationId: this.form.value.organizationId!,
        redirectUris
      };
      this.dialogRef.close(dto);
    }
  }
}
