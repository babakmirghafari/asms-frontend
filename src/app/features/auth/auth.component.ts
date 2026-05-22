import { Component, OnInit, inject, computed } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DecimalPipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { AuthFeatureStore } from './auth.store';
import { AuthStore } from '../../core/store/auth.store';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const pw = control.get('newPassword')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return pw && confirm && pw !== confirm ? { mismatch: true } : null;
}

@Component({
  selector: 'asms-auth',
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DecimalPipe,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslateModule
  ]
})
export class AuthComponent implements OnInit {
  protected readonly store = inject(AuthFeatureStore);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly loginForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(2)]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  readonly mfaForm = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
  });

  readonly changePasswordForm = this.fb.group(
    {
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    },
    { validators: passwordMatchValidator }
  );

  showPassword = false;

  // Org selection state
  selectedOrgId: string | null = null;

  // Sample org data for the select-org step
  readonly sampleOrgs = [
    {
      id: 'org-northwind',
      name: 'Northwind Bank',
      members: 1284,
      status: 'Active',
      color: '#3f51b5',
      isPrimary: true,
      complianceTags: ['SOC2', 'ISO 27001']
    },
    {
      id: 'org-globex',
      name: 'Globex Europe',
      members: 642,
      status: 'Active',
      color: '#009688',
      isPrimary: false,
      complianceTags: ['ISO 27001']
    },
    {
      id: 'org-acme',
      name: 'Acme Retail',
      members: 328,
      status: 'Active',
      color: '#f57c00',
      isPrimary: false,
      complianceTags: ['GDPR']
    }
  ];

  readonly passwordStrengthClass = computed(() => {
    const pw: string = this.changePasswordForm.get('newPassword')?.value ?? '';
    const score = this.calcPasswordScore(pw);
    if (score <= 1) return 'strength-weak';
    if (score === 2) return 'strength-fair';
    if (score === 3) return 'strength-good';
    return 'strength-strong';
  });

  readonly passwordStrengthLabel = computed(() => {
    const pw: string = this.changePasswordForm.get('newPassword')?.value ?? '';
    const score = this.calcPasswordScore(pw);
    if (score <= 1) return 'AUTH.STRENGTH_WEAK';
    if (score === 2) return 'AUTH.STRENGTH_FAIR';
    if (score === 3) return 'AUTH.STRENGTH_GOOD';
    return 'AUTH.STRENGTH_STRONG';
  });

  private calcPasswordScore(pw: string): number {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  }

  ngOnInit(): void {
    if (this.authStore.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  submitLogin(): void {
    if (this.loginForm.invalid) return;
    const { username, password } = this.loginForm.value;
    this.store.login(username!, password!);
  }

  submitMfa(): void {
    if (this.mfaForm.invalid) return;
    this.store.verifyMfa(this.mfaForm.value.code!);
  }

  submitChangePassword(): void {
    if (this.changePasswordForm.invalid) return;
    const { newPassword } = this.changePasswordForm.value;
    this.store.changePassword(newPassword!);
  }

  selectOrg(orgId: string): void {
    this.store.selectOrg(orgId);
  }

  backToLogin(): void {
    this.store.resetToLogin();
  }
}
