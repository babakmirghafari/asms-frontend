import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { OrganizationsStore } from '../../organizations/organizations.store';
import { AppMock } from '../app-mock.model';

export interface AppFormDialogData {
  app?: AppMock;
  isEdit: boolean;
}

export type AppFormResult = Partial<AppMock>;

@Component({
  selector: 'asms-app-form-dialog',
  templateUrl: './app-form-dialog.component.html',
  styleUrl: './app-form-dialog.component.scss',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
    TranslateModule
  ]
})
export class AppFormDialogComponent implements OnInit {
  readonly data: AppFormDialogData = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<AppFormDialogComponent>);
  private readonly fb = inject(FormBuilder);
  readonly orgsStore = inject(OrganizationsStore);

  readonly form = this.fb.group({
    name: [this.data.app?.name ?? '', [Validators.required, Validators.minLength(2)]],
    clientId: [
      { value: this.data.app?.clientId ?? '', disabled: this.data.isEdit },
      [Validators.required, Validators.minLength(2)]
    ],
    type: [this.data.app?.type ?? 'confidential', Validators.required],
    organizationId: [this.data.app?.organizationId ?? '', Validators.required],
    redirectUris: [this.data.app?.redirectUris?.join('\n') ?? '']
  });

  ngOnInit(): void {
    this.orgsStore.loadAll(0, 100);
  }

  cancel(): void {
    this.dialogRef.close(null);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const redirectUrisRaw = raw.redirectUris?.trim() ?? '';
    const redirectUris = redirectUrisRaw
      ? redirectUrisRaw.split('\n').map((u: string) => u.trim()).filter(Boolean)
      : [];

    const selectedOrg = this.orgsStore.items().find(o => o.id === raw.organizationId);

    const result: AppFormResult = {
      name: raw.name!,
      clientId: raw.clientId!,
      type: raw.type as 'confidential' | 'public',
      organizationId: raw.organizationId!,
      organizationName: selectedOrg?.name ?? raw.organizationId!,
      redirectUris,
      status: this.data.app?.status ?? 'ACTIVE',
      allowedScopes: this.data.app?.allowedScopes ?? ['openid', 'profile', 'email']
    };
    this.dialogRef.close(result);
  }
}
