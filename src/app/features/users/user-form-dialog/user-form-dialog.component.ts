import { Component, inject, ViewChild } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatRadioModule } from '@angular/material/radio';
import { DecimalPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { UserDto, CreateUserRequestDto, UpdateUserRequestDto } from '@babakmirghafari/asms-api-client';

export interface UserFormDialogData {
  user?: UserDto;
  isEdit: boolean;
}

export type UserFormResult = CreateUserRequestDto | UpdateUserRequestDto;

interface WizardStep {
  index: number;
  label: string;
  icon: string;
}

@Component({
  selector: 'asms-user-form-dialog',
  templateUrl: './user-form-dialog.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    DecimalPipe,
    MatDialogModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatIconModule,
    MatStepperModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatRadioModule,
    TranslateModule
  ]
})
export class UserFormDialogComponent {
  readonly data: UserFormDialogData = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<UserFormDialogComponent>);
  private readonly fb = inject(FormBuilder);

  @ViewChild('stepper') stepper!: MatStepper;

  isLoading = false;
  activeStepIndex = 0;

  // Custom step indicator configuration
  readonly wizardSteps: WizardStep[] = [
    { index: 0, label: 'Identity', icon: 'person' },
    { index: 1, label: 'Password', icon: 'key' },
    { index: 2, label: 'Organizations', icon: 'business' },
    { index: 3, label: 'Permissions', icon: 'security' },
    { index: 4, label: 'Auth & MFA', icon: 'lock' },
    { index: 5, label: 'Station', icon: 'router' },
    { index: 6, label: 'Status', icon: 'toggle_on' },
    { index: 7, label: 'Review', icon: 'check_circle' }
  ];

  // ──────────────────────────────────────────
  // Step 1 — Identity
  // ──────────────────────────────────────────

  readonly identityForm = this.fb.group({
    // Merged fullName field used in create mode
    fullName: [this.data.user?.fullName ?? '', [Validators.required]],
    firstName: [this.data.user ? (this.data.user.fullName?.split(' ')[0] ?? '') : ''],
    lastName: [this.data.user ? (this.data.user.fullName?.split(' ').slice(1).join(' ') ?? '') : ''],
    username: [this.data.user?.username ?? '', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-z0-9._-]+$/)]],
    email: [this.data.user?.email ?? '', [Validators.required, Validators.email]],
    phoneNumber: [this.data.user?.phoneNumber ?? '', [Validators.pattern(/^\+?[\d\s\-().]{7,20}$/)]],
    department: [this.data.user?.department ?? ''],
    jobTitle: [''],
    manager: ['']
  });

  // ──────────────────────────────────────────
  // Step 2 — Password delivery
  // ──────────────────────────────────────────

  generatedPassword = this.generatePassword();
  showTempPassword = false;
  passwordCopied = false;

  readonly passwordForm = this.fb.group({
    deliveryMethod: ['email'],
    passwordExpiry: ['24h'],
    forcePasswordChange: [true]
  });

  // ──────────────────────────────────────────
  // Step 3 — Organization assignment
  // ──────────────────────────────────────────

  readonly sampleOrgs = [
    { id: 'org-northwind', name: 'Northwind Bank', members: 1284, color: '#3f51b5' },
    { id: 'org-globex', name: 'Globex Europe', members: 642, color: '#009688' },
    { id: 'org-acme', name: 'Acme Retail', members: 328, color: '#f57c00' }
  ];

  selectedOrgIds: string[] = [];
  primaryOrgId: string | null = null;
  showOrgSelectionAfterLogin = false;

  isOrgSelected(orgId: string): boolean {
    return this.selectedOrgIds.includes(orgId);
  }

  toggleOrg(orgId: string): void {
    const idx = this.selectedOrgIds.indexOf(orgId);
    if (idx >= 0) {
      this.selectedOrgIds = this.selectedOrgIds.filter(id => id !== orgId);
      if (this.primaryOrgId === orgId) {
        this.primaryOrgId = this.selectedOrgIds[0] ?? null;
      }
    } else {
      this.selectedOrgIds = [...this.selectedOrgIds, orgId];
      if (!this.primaryOrgId) this.primaryOrgId = orgId;
    }
    this.showOrgSelectionAfterLogin = this.selectedOrgIds.length >= 2;
  }

  getOrgName(orgId: string): string {
    return this.sampleOrgs.find(o => o.id === orgId)?.name ?? orgId;
  }

  // ──────────────────────────────────────────
  // Step 4 — Permission assignment
  // ──────────────────────────────────────────

  readonly permissionGroups = [
    { id: 'pg-finance', name: 'Finance Approver' },
    { id: 'pg-audit', name: 'Audit Viewer' },
    { id: 'pg-security', name: 'Security Admin' },
    { id: 'pg-branch', name: 'Branch Operator' },
    { id: 'pg-appowner', name: 'Application Owner' }
  ];

  readonly availablePermissions = [
    'corebanking.accounts.read',
    'corebanking.accounts.approve',
    'corebanking.payments.manage',
    'claims.case.read',
    'claims.case.update',
    'iam.users.manage',
    'iam.permissions.import'
  ];

  selectedGroupIds: string[] = [];
  selectedDirectPermissions: string[] = [];
  directPermissionToAdd: string | null = null;

  isGroupSelected(groupId: string): boolean {
    return this.selectedGroupIds.includes(groupId);
  }

  toggleGroup(groupId: string): void {
    const idx = this.selectedGroupIds.indexOf(groupId);
    if (idx >= 0) {
      this.selectedGroupIds = this.selectedGroupIds.filter(id => id !== groupId);
    } else {
      this.selectedGroupIds = [...this.selectedGroupIds, groupId];
    }
  }

  getGroupName(groupId: string): string {
    return this.permissionGroups.find(g => g.id === groupId)?.name ?? groupId;
  }

  addDirectPermission(perm: string | null): void {
    if (!perm) return;
    if (!this.selectedDirectPermissions.includes(perm)) {
      this.selectedDirectPermissions = [...this.selectedDirectPermissions, perm];
    }
    setTimeout(() => { this.directPermissionToAdd = null; }, 50);
  }

  removeDirectPermission(perm: string): void {
    this.selectedDirectPermissions = this.selectedDirectPermissions.filter(p => p !== perm);
  }

  isSensitivePermission(perm: string): boolean {
    return perm.endsWith('.manage') || perm.endsWith('.approve');
  }

  hasSensitivePermissions(): boolean {
    return this.selectedDirectPermissions.some(p => this.isSensitivePermission(p));
  }

  get effectivePermissions(): string[] {
    return [...new Set([...this.selectedDirectPermissions])];
  }

  // ──────────────────────────────────────────
  // Step 5 — Authentication & security
  // ──────────────────────────────────────────

  readonly securityForm = this.fb.group({
    mfaEnabled: [false],
    requireMfaEnrollment: [true],
    failedLoginThreshold: [3, [Validators.required, Validators.min(1), Validators.max(10)]],
    lockDuration: ['30m']
  });

  // ──────────────────────────────────────────
  // Step 6 — Station policy
  // ──────────────────────────────────────────

  readonly weekdays = [
    { value: 'MONDAY', label: 'Mon' },
    { value: 'TUESDAY', label: 'Tue' },
    { value: 'WEDNESDAY', label: 'Wed' },
    { value: 'THURSDAY', label: 'Thu' },
    { value: 'FRIDAY', label: 'Fri' },
    { value: 'SATURDAY', label: 'Sat' },
    { value: 'SUNDAY', label: 'Sun' }
  ];

  selectedWorkdays: boolean[] = [true, true, true, true, true, false, false];
  allowedIPs: string[] = [];

  readonly stationForm = this.fb.group({
    applyStationPolicy: [false],
    workStartTime: ['09:00'],
    workEndTime: ['18:00']
  });

  addIP(event: Event): void {
    const input = event.target as HTMLInputElement;
    const val = input.value.trim();
    if (val && !this.allowedIPs.includes(val)) {
      this.allowedIPs = [...this.allowedIPs, val];
    }
    input.value = '';
    event.preventDefault();
  }

  removeIP(ip: string): void {
    this.allowedIPs = this.allowedIPs.filter(i => i !== ip);
  }

  toggleWorkday(index: number): void {
    const copy = [...this.selectedWorkdays];
    copy[index] = !copy[index];
    this.selectedWorkdays = copy;
  }

  get selectedWorkdayLabels(): string {
    const labels = this.weekdays.filter((_, i) => this.selectedWorkdays[i]).map(d => d.label);
    return labels.length > 0 ? labels.join(', ') : 'None';
  }

  get stationPolicySummary(): string {
    const ipCount = this.allowedIPs.length;
    const days = this.selectedWorkdayLabels;
    const start = this.stationForm.get('workStartTime')?.value ?? '09:00';
    const end = this.stationForm.get('workEndTime')?.value ?? '18:00';
    const ipText = ipCount > 0 ? `${ipCount} IP(s)` : 'any IP';
    return `User can access from ${ipText}, ${days}, ${start}–${end}`;
  }

  // ──────────────────────────────────────────
  // Step 7 — Status & invitation
  // ──────────────────────────────────────────

  readonly statusForm = this.fb.group({
    status: ['ACTIVE'],
    sendInvitation: [true],
    sendTempPassword: [true]
  });

  // ──────────────────────────────────────────
  // Stepper navigation
  // ──────────────────────────────────────────

  onStepChange(event: StepperSelectionEvent | { selectedIndex: number }): void {
    this.activeStepIndex = event.selectedIndex;
  }

  goNext(stepper: MatStepper): void {
    // For step 1 (identity) validate before going next
    if (this.activeStepIndex === 0 && this.identityForm.invalid) {
      this.identityForm.markAllAsTouched();
      return;
    }
    stepper.next();
    this.activeStepIndex = stepper.selectedIndex;
  }

  goBack(stepper: MatStepper): void {
    stepper.previous();
    this.activeStepIndex = stepper.selectedIndex;
  }

  // ──────────────────────────────────────────
  // Password helpers
  // ──────────────────────────────────────────

  private generatePassword(): string {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
    return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }

  toggleTempPassword(): void {
    this.showTempPassword = !this.showTempPassword;
  }

  copyPassword(): void {
    navigator.clipboard.writeText(this.generatedPassword).catch(() => undefined);
    this.passwordCopied = true;
    setTimeout(() => { this.passwordCopied = false; }, 2000);
  }

  // ──────────────────────────────────────────
  // Dialog actions
  // ──────────────────────────────────────────

  cancel(): void {
    this.dialogRef.close(null);
  }

  submit(): void {
    if (this.data.isEdit) {
      if (this.identityForm.invalid) {
        this.identityForm.markAllAsTouched();
        return;
      }
      const fn = this.identityForm.value.firstName?.trim() ?? '';
      const ln = this.identityForm.value.lastName?.trim() ?? '';
      const dto: UpdateUserRequestDto = {
        email: this.identityForm.value.email!,
        firstName: fn,
        lastName: ln || fn,
        phoneNumber: this.identityForm.value.phoneNumber ?? undefined
      };
      this.dialogRef.close(dto);
    } else {
      if (this.identityForm.invalid) {
        this.identityForm.markAllAsTouched();
        return;
      }

      const fullNameVal = this.identityForm.value.fullName?.trim() ?? '';

      const workdayValues = this.weekdays
        .filter((_, i) => this.selectedWorkdays[i])
        .map(d => d.value as CreateUserRequestDto.WorkdaysEnum);

      const dto: CreateUserRequestDto = {
        username: this.identityForm.value.username!,
        email: this.identityForm.value.email!,
        fullName: fullNameVal || undefined,
        phoneNumber: this.identityForm.value.phoneNumber?.trim() || undefined,
        department: this.identityForm.value.department?.trim() || undefined,
        organizationIds: this.selectedOrgIds.length > 0 ? this.selectedOrgIds : undefined,
        workdays: workdayValues.length > 0 && this.stationForm.get('applyStationPolicy')?.value ? workdayValues : undefined,
        ipRestriction: (this.stationForm.get('applyStationPolicy')?.value && this.allowedIPs.length > 0)
          ? this.allowedIPs.join(',')
          : undefined,
        workHours: (this.stationForm.get('applyStationPolicy')?.value)
          ? {
              start: this.stationForm.value.workStartTime ?? '09:00',
              end: this.stationForm.value.workEndTime ?? '18:00'
            }
          : undefined,
        sendTempPassword: this.statusForm.value.sendTempPassword ?? true
      };
      this.dialogRef.close(dto);
    }
  }
}
