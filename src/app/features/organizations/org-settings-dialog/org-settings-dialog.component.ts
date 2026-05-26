import { Component, inject, signal } from '@angular/core';
import { LowerCasePipe } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { OrganizationDto } from '@babakmirghafari/asms-api-client';
import { OrganizationsStore } from '../organizations.store';

export interface OrgSettingsDialogData {
  org: OrganizationDto;
  avatarColor: string;
  initials: string;
}

@Component({
  selector: 'asms-org-settings-dialog',
  templateUrl: './org-settings-dialog.component.html',
  styleUrl: './org-settings-dialog.component.scss',
  standalone: true,
  imports: [
    LowerCasePipe,
    ReactiveFormsModule,
    MatButtonModule, MatIconModule, MatTabsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatSlideToggleModule, MatDividerModule,
    TranslateModule
  ]
})
export class OrgSettingsDialogComponent {
  readonly data: OrgSettingsDialogData = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<OrgSettingsDialogComponent>);
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(OrganizationsStore);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  isSaving = signal(false);

  readonly identityProviders = ['Okta', 'Azure AD', 'Google Workspace', 'Auth0', 'OneLogin', 'Ping Identity'];
  readonly dataResidencyRegions = [
    { value: 'us-east-1',     label: 'US East (N. Virginia)' },
    { value: 'eu-central-1',  label: 'EU Central (Frankfurt)' },
    { value: 'ap-southeast-1', label: 'AP Southeast (Singapore)' }
  ];

  readonly securityForm = this.fb.group({
    requireMfa:              [false],
    forceMfaOnSensitive:     [false],
    sessionTimeout:          [30, [Validators.min(5), Validators.max(1440)]],
    maxConcurrentSessions:   [3,  [Validators.min(1), Validators.max(20)]],
    allowedIpCidrs:          ['']
  });

  readonly ssoForm = this.fb.group({
    ssoEnabled:       [false],
    identityProvider: ['Okta'],
    autoProvision:    [false],
    autoDeprovision:  [false]
  });

  readonly brandingForm = this.fb.group({
    logoUrl:          [this.data.org.logoUrl ?? ''],
    primaryColor:     ['#3B82F6'],
    customLoginUrl:   [''],
    welcomeMessage:   ['Welcome back']
  });

  readonly complianceForm = this.fb.group({
    dataResidency:                 ['eu-central-1'],
    enforceDataResidencyOnExports: [false],
    longTermAuditRetention:        [false],
    gdprDataExportEndpoint:        [false]
  });

  get ssoSlug(): string {
    return (this.data.org.name ?? '').toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
  }

  close(): void {
    this.dialogRef.close();
  }

  async save(): Promise<void> {
    this.isSaving.set(true);
    try {
      // Only logoUrl from branding is in the contract UpdateOrganizationRequestDto
      const logoUrl = this.brandingForm.value.logoUrl?.trim() || undefined;
      await this.store.update(this.data.org.id, {
        name:        this.data.org.name,
        description: this.data.org.description,
      });
      this.snackBar.open(
        this.translate.instant('ORGANIZATIONS.SETTINGS_SAVED'),
        this.translate.instant('COMMON.CLOSE'),
        { duration: 3000, panelClass: 'snackbar-success' }
      );
    } catch {
      this.snackBar.open(
        this.translate.instant('COMMON.ERROR'),
        this.translate.instant('COMMON.CLOSE'),
        { duration: 4000, panelClass: 'snackbar-error' }
      );
    } finally {
      this.isSaving.set(false);
    }
  }

  async suspendOrg(): Promise<void> {
    await this.store.update(this.data.org.id, {
      name:   this.data.org.name,
      status: 'SUSPENDED'
    });
    this.snackBar.open(
      this.translate.instant('ORGANIZATIONS.SUSPENDED_SUCCESS'),
      this.translate.instant('COMMON.CLOSE'),
      { duration: 3000, panelClass: 'snackbar-success' }
    );
    this.dialogRef.close('suspended');
  }

  async deleteOrg(): Promise<void> {
    await this.store.delete(this.data.org.id);
    this.snackBar.open(
      this.translate.instant('ORGANIZATIONS.DELETED_SUCCESS'),
      this.translate.instant('COMMON.CLOSE'),
      { duration: 3000, panelClass: 'snackbar-success' }
    );
    this.dialogRef.close('deleted');
  }
}
