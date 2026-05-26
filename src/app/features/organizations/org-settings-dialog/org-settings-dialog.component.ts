import { Component, OnInit, inject, signal } from '@angular/core';
import { LowerCasePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { OrganizationDto, OrganizationSettingsDto, UpdateOrganizationRequestDto, UpdateOrganizationSettingsRequestDto } from '@babakmirghafari/asms-api-client';
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
    MatSlideToggleModule, MatDividerModule, MatProgressSpinnerModule,
    TranslateModule
  ]
})
export class OrgSettingsDialogComponent implements OnInit {
  readonly data: OrgSettingsDialogData = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<OrgSettingsDialogComponent>);
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(OrganizationsStore);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  isSaving = signal(false);
  isLoadingSettings = signal(true);
  readonly logoPreviewUrl = signal<string | null>(this.data.org.logoUrl ?? null);

  readonly identityProviders: { value: OrganizationSettingsDto.IdentityProviderEnum; label: string }[] = [
    { value: 'OKTA',             label: 'Okta' },
    { value: 'AZURE_AD',         label: 'Azure AD' },
    { value: 'GOOGLE_WORKSPACE', label: 'Google Workspace' },
    { value: 'AUTH0',            label: 'Auth0' },
    { value: 'ONE_LOGIN',        label: 'OneLogin' },
    { value: 'PING_IDENTITY',    label: 'Ping Identity' },
  ];

  readonly dataResidencyRegions = [
    { value: 'us-east-1',      label: 'US East (N. Virginia)' },
    { value: 'eu-central-1',   label: 'EU Central (Frankfurt)' },
    { value: 'ap-southeast-1', label: 'AP Southeast (Singapore)' }
  ];

  readonly securityForm = this.fb.group({
    requireMfa:            [false],
    forceMfaOnSensitive:   [false],
    sessionTimeout:        [30, [Validators.min(5), Validators.max(1440)]],
    maxConcurrentSessions: [3,  [Validators.min(1), Validators.max(20)]],
    allowedIpCidrs:        ['']
  });

  readonly ssoForm = this.fb.group({
    ssoEnabled:       [false],
    identityProvider: ['OKTA' as OrganizationSettingsDto.IdentityProviderEnum],
    autoProvision:    [false],
    autoDeprovision:  [false]
  });

  readonly brandingForm = this.fb.group({
    primaryColor:    ['#2563EB'],
    customLoginUrl:  [''],
    welcomeMessage:  ['Welcome back']
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

  async ngOnInit(): Promise<void> {
    try {
      const existing = this.store.settingsMap()[this.data.org.id]
        ?? await this.store.loadSettings(this.data.org.id);
      this.patchForms(existing);
    } catch {
      // backend unavailable — forms stay at defaults
    } finally {
      this.isLoadingSettings.set(false);
    }
  }

  private patchForms(s: OrganizationSettingsDto): void {
    this.securityForm.patchValue({
      requireMfa:            s.requireMfa,
      forceMfaOnSensitive:   s.forceMfaOnSensitive,
      sessionTimeout:        s.sessionTimeout,
      maxConcurrentSessions: s.maxConcurrentSessions,
      allowedIpCidrs:        s.allowedIpCidrs ?? '',
    });
    this.ssoForm.patchValue({
      ssoEnabled:       s.ssoEnabled,
      identityProvider: s.identityProvider ?? 'OKTA',
      autoProvision:    s.autoProvision,
      autoDeprovision:  s.autoDeprovision,
    });
    this.brandingForm.patchValue({
      primaryColor:   s.primaryColor ?? '#2563EB',
      customLoginUrl: s.customLoginUrl ?? '',
      welcomeMessage: s.welcomeMessage ?? '',
    });
    this.complianceForm.patchValue({
      dataResidency:                 s.dataResidency ?? 'eu-central-1',
      enforceDataResidencyOnExports: s.enforceDataResidencyOnExports,
      longTermAuditRetention:        s.longTermAuditRetention,
      gdprDataExportEndpoint:        s.gdprDataExportEndpoint,
    });
    if (s.primaryColor) {
      this.brandingForm.patchValue({ primaryColor: s.primaryColor });
    }
  }

  onLogoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => this.logoPreviewUrl.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  close(): void {
    this.dialogRef.close();
  }

  async save(): Promise<void> {
    this.isSaving.set(true);
    try {
      const sv = this.securityForm.value;
      const so = this.ssoForm.value;
      const br = this.brandingForm.value;
      const co = this.complianceForm.value;

      const settingsDto: UpdateOrganizationSettingsRequestDto = {
        requireMfa:                    sv.requireMfa            ?? false,
        forceMfaOnSensitive:           sv.forceMfaOnSensitive   ?? false,
        sessionTimeout:                sv.sessionTimeout        ?? 30,
        maxConcurrentSessions:         sv.maxConcurrentSessions ?? 3,
        allowedIpCidrs:                sv.allowedIpCidrs        || undefined,
        ssoEnabled:                    so.ssoEnabled            ?? false,
        identityProvider:              so.identityProvider as OrganizationSettingsDto.IdentityProviderEnum,
        autoProvision:                 so.autoProvision         ?? false,
        autoDeprovision:               so.autoDeprovision       ?? false,
        primaryColor:                  br.primaryColor          || undefined,
        customLoginUrl:                br.customLoginUrl        || undefined,
        welcomeMessage:                br.welcomeMessage        || undefined,
        dataResidency:                 co.dataResidency         || undefined,
        enforceDataResidencyOnExports: co.enforceDataResidencyOnExports ?? false,
        longTermAuditRetention:        co.longTermAuditRetention        ?? false,
        gdprDataExportEndpoint:        co.gdprDataExportEndpoint        ?? false,
      };

      const orgDto: UpdateOrganizationRequestDto = {
        name:        this.data.org.name,
        description: this.data.org.description,
        logoUrl:     this.logoPreviewUrl() ?? undefined,
      };

      await Promise.all([
        this.store.update(this.data.org.id, orgDto),
        this.store.saveSettings(this.data.org.id, settingsDto),
      ]);

      this.snackBar.open(
        this.translate.instant('ORGANIZATIONS.SETTINGS_SAVED'),
        this.translate.instant('COMMON.CLOSE'),
        { duration: 3000, panelClass: 'snackbar-success' }
      );
      this.dialogRef.close('saved');
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
    await this.store.update(this.data.org.id, { name: this.data.org.name, status: 'SUSPENDED' });
    this.snackBar.open(
      this.translate.instant('ORGANIZATIONS.SUSPENDED_SUCCESS'),
      this.translate.instant('COMMON.CLOSE'),
      { duration: 3000, panelClass: 'snackbar-success' }
    );
    this.dialogRef.close('suspended');
  }

  async activateOrg(): Promise<void> {
    await this.store.update(this.data.org.id, { name: this.data.org.name, status: 'ACTIVE' });
    this.snackBar.open(
      this.translate.instant('ORGANIZATIONS.ACTIVATED_SUCCESS'),
      this.translate.instant('COMMON.CLOSE'),
      { duration: 3000, panelClass: 'snackbar-success' }
    );
    this.dialogRef.close('activated');
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
