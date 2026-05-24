import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatRadioModule } from '@angular/material/radio';
import { DecimalPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { UserDto, CreateUserRequestDto, UpdateUserRequestDto, OrganizationDto, PermissionDto } from '@babakmirghafari/asms-api-client';
import { AsmsModalComponent, ModalStep } from '../../../shared/components/modal/modal.component';
import { OrganizationsStore } from '../../organizations/organizations.store';
import { PermissionsStore } from '../../permissions/permissions.store';

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
    FormsModule,
    DecimalPipe,
    MatButtonModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatRadioModule,
    TranslateModule,
    AsmsModalComponent
  ]
})
export class UserFormDialogComponent implements OnInit {
  readonly data: UserFormDialogData = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<UserFormDialogComponent>);
  private readonly fb = inject(FormBuilder);
  private readonly orgsStore = inject(OrganizationsStore);
  private readonly permissionsStore = inject(PermissionsStore);

  isLoading = false;

  // Signal-based step tracking
  readonly currentStep = signal(0);

  // Wizard step configuration for asms-modal
  readonly wizardSteps: ModalStep[] = [
    { label: 'USERS.STEP_1', icon: 'person' },
    { label: 'USERS.STEP_2', icon: 'key' },
    { label: 'USERS.STEP_3', icon: 'business' },
    { label: 'USERS.STEP_4', icon: 'security' },
    { label: 'USERS.STEP_5', icon: 'lock' },
    { label: 'USERS.STEP_6', icon: 'router' },
    { label: 'USERS.STEP_7', icon: 'toggle_on' },
    { label: 'USERS.STEP_8', icon: 'check_circle' }
  ];

  readonly isFirstStep = computed(() => this.currentStep() === 0);
  readonly isLastStep  = computed(() => this.currentStep() === this.wizardSteps.length - 1);

  /** Returns true if the user can proceed from the current step. */
  readonly canProceedAtCurrentStep = computed(() => {
    switch (this.currentStep()) {
      case 0: return this.identityForm.valid;
      case 1: return this.passwordForm.valid;
      default: return true;
    }
  });

  // ──────────────────────────────────────────
  // Step 1 — Identity
  // ──────────────────────────────────────────

  readonly identityForm = this.fb.group({
    fullName:    [this.data.user?.fullName ?? '', [Validators.required]],
    firstName:   [this.data.user ? (this.data.user.fullName?.split(' ')[0] ?? '') : ''],
    lastName:    [this.data.user ? (this.data.user.fullName?.split(' ').slice(1).join(' ') ?? '') : ''],
    username:    [this.data.user?.username ?? '', [Validators.required, Validators.minLength(3), Validators.pattern(/^[a-z0-9._-]+$/)]],
    email:       [this.data.user?.email ?? '', [Validators.required, Validators.email]],
    phoneNumber: [this.data.user?.phoneNumber ?? '', [Validators.pattern(/^\+?[\d\s\-().]{7,20}$/)]],
    department:  [this.data.user?.department ?? ''],
    jobTitle:    [''],
    manager:     ['']
  });

  // ──────────────────────────────────────────
  // Step 2 — Password delivery
  // ──────────────────────────────────────────

  generatedPassword = this.generatePassword();
  showTempPassword = false;
  passwordCopied = false;

  readonly passwordForm = this.fb.group({
    deliveryMethod:      ['email'],
    passwordExpiry:      ['24h'],
    forcePasswordChange: [true]
  });

  // ──────────────────────────────────────────
  // Step 3 — Organization assignment (real data)
  // ──────────────────────────────────────────

  readonly availableOrgs = computed(() => this.orgsStore.items());
  readonly orgsLoading   = computed(() => this.orgsStore.loading());

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
    // Reload permissions for newly selected orgs and clear current permission selection
    this.permissionsStore.loadByOrganizationIds(this.selectedOrgIds);
    this.selectedDirectPermissions = [];
  }

  getOrgName(orgId: string): string {
    return this.availableOrgs().find(o => o.id === orgId)?.name ?? orgId;
  }

  getOrgMemberCount(orgId: string): number {
    return this.availableOrgs().find(o => o.id === orgId)?.memberCount ?? 0;
  }

  // ──────────────────────────────────────────
  // Step 4 — Permission assignment (real data)
  // ──────────────────────────────────────────

  readonly availablePermissions = computed(() => this.permissionsStore.orgFilteredItems());
  readonly permissionsLoading   = computed(() => this.permissionsStore.loading());

  selectedDirectPermissions: PermissionDto[] = [];
  directPermissionToAdd: string | null = null;

  addDirectPermission(permId: string | null): void {
    if (!permId) return;
    const perm = this.availablePermissions().find(p => p.id === permId);
    if (perm && !this.selectedDirectPermissions.some(p => p.id === permId)) {
      this.selectedDirectPermissions = [...this.selectedDirectPermissions, perm];
    }
    setTimeout(() => { this.directPermissionToAdd = null; }, 50);
  }

  removeDirectPermission(permId: string): void {
    this.selectedDirectPermissions = this.selectedDirectPermissions.filter(p => p.id !== permId);
  }

  isSensitivePermission(perm: PermissionDto): boolean {
    return perm.action === 'ADMIN' || perm.action === 'DELETE';
  }

  hasSensitivePermissions(): boolean {
    return this.selectedDirectPermissions.some(p => this.isSensitivePermission(p));
  }

  // ──────────────────────────────────────────
  // Step 5 — Authentication & security
  // ──────────────────────────────────────────

  readonly securityForm = this.fb.group({
    mfaEnabled:             [false],
    requireMfaEnrollment:   [true],
    failedLoginThreshold:   [3, [Validators.required, Validators.min(1), Validators.max(10)]],
    lockDuration:           ['30m']
  });

  // ──────────────────────────────────────────
  // Step 6 — Station policy
  // ──────────────────────────────────────────

  readonly weekdays = [
    { value: 'MONDAY',    label: 'Mon' },
    { value: 'TUESDAY',   label: 'Tue' },
    { value: 'WEDNESDAY', label: 'Wed' },
    { value: 'THURSDAY',  label: 'Thu' },
    { value: 'FRIDAY',    label: 'Fri' },
    { value: 'SATURDAY',  label: 'Sat' },
    { value: 'SUNDAY',    label: 'Sun' }
  ];

  selectedWorkdays: boolean[] = [true, true, true, true, true, false, false];
  allowedIPs: string[] = [];

  readonly stationForm = this.fb.group({
    applyStationPolicy: [false],
    workStartTime:      ['09:00'],
    workEndTime:        ['18:00']
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
    status:           ['ACTIVE'],
    sendInvitation:   [true],
    sendTempPassword: [true]
  });

  // ──────────────────────────────────────────
  // Lifecycle
  // ──────────────────────────────────────────

  ngOnInit(): void {
    this.orgsStore.loadAll(0, 100);
  }

  // ──────────────────────────────────────────
  // Wizard navigation
  // ──────────────────────────────────────────

  goNext(): void {
    if (this.currentStep() === 0 && this.identityForm.invalid) {
      this.identityForm.markAllAsTouched();
      return;
    }
    if (this.currentStep() < this.wizardSteps.length - 1) {
      this.currentStep.update(s => s + 1);
    }
  }

  goBack(): void {
    if (this.currentStep() > 0) {
      this.currentStep.update(s => s - 1);
    }
  }

  jumpToStep(index: number): void {
    this.currentStep.set(index);
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
        email:       this.identityForm.value.email!,
        firstName:   fn,
        lastName:    ln || fn,
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
        username:             this.identityForm.value.username!,
        email:                this.identityForm.value.email!,
        fullName:             fullNameVal || undefined,
        phoneNumber:          this.identityForm.value.phoneNumber?.trim() || undefined,
        department:           this.identityForm.value.department?.trim() || undefined,
        organizationIds:      this.selectedOrgIds.length > 0 ? this.selectedOrgIds : undefined,
        directPermissionIds:  this.selectedDirectPermissions.length > 0
                                ? this.selectedDirectPermissions.map(p => p.id!)
                                : undefined,
        workdays:             workdayValues.length > 0 && this.stationForm.get('applyStationPolicy')?.value
                                ? workdayValues : undefined,
        ipRestriction:        (this.stationForm.get('applyStationPolicy')?.value && this.allowedIPs.length > 0)
                                ? this.allowedIPs.join(',') : undefined,
        workHours:            this.stationForm.get('applyStationPolicy')?.value
                                ? { start: this.stationForm.value.workStartTime ?? '09:00',
                                    end:   this.stationForm.value.workEndTime   ?? '18:00' }
                                : undefined,
        sendTempPassword:     this.statusForm.value.sendTempPassword ?? true
      };
      this.dialogRef.close(dto);
    }
  }
}
