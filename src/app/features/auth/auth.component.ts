import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { AuthFeatureStore } from './auth.store';
import { AuthStore } from '../../core/store/auth.store';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const pw = control.get('newPassword')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return pw && confirm && pw !== confirm ? { mismatch: true } : null;
}

interface OrgItem {
  id: string;
  name: string;
  initials: string;
  domain: string;
  badge: 'Primary' | 'Sandbox' | '';
  color: string;
  members: number;
  plan: string;
  region: string;
  lastAccess: string;
  complianceTags: string[];
}

@Component({
  selector: 'asms-auth',
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
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

  // ── MFA digit boxes ──────────────────────────────────────────
  readonly mfaDigitBoxes = Array.from({ length: 6 }, (_, i) => ({ index: i }));
  private mfaDigits = signal<string[]>(['', '', '', '', '', '']);

  get mfaCodeValue(): string {
    return this.mfaDigits().join('');
  }

  getMfaDigit(index: number): string {
    return this.mfaDigits()[index];
  }

  onMfaDigitInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const val = input.value.replace(/\D/g, '').slice(-1);
    const digits = [...this.mfaDigits()];
    digits[index] = val;
    this.mfaDigits.set(digits);
    this.mfaForm.get('code')?.setValue(digits.join(''));

    if (val && index < 5) {
      this.focusMfaBox(index + 1);
    }
    if (this.mfaCodeValue.length === 6) {
      this.submitMfa();
    }
  }

  onMfaDigitKeydown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace') {
      const digits = [...this.mfaDigits()];
      if (digits[index]) {
        digits[index] = '';
        this.mfaDigits.set(digits);
        this.mfaForm.get('code')?.setValue(digits.join(''));
      } else if (index > 0) {
        this.focusMfaBox(index - 1);
      }
    }
  }

  onMfaPaste(event: ClipboardEvent): void {
    const pasted = event.clipboardData?.getData('text').replace(/\D/g, '').slice(0, 6) ?? '';
    if (pasted.length === 0) return;
    event.preventDefault();
    const digits = pasted.split('').concat(Array(6).fill('')).slice(0, 6);
    this.mfaDigits.set(digits);
    this.mfaForm.get('code')?.setValue(digits.join(''));
    const lastFilled = Math.min(pasted.length, 5);
    this.focusMfaBox(lastFilled);
    if (pasted.length === 6) {
      setTimeout(() => this.submitMfa(), 50);
    }
  }

  private focusMfaBox(index: number): void {
    const el = document.querySelector<HTMLInputElement>(`[data-mfa-index="${index}"]`);
    el?.focus();
  }

  // ── Org selection ─────────────────────────────────────────────
  selectedOrgId: string | null = null;
  orgSearchQuery = '';

  readonly sampleOrgs: OrgItem[] = [
    {
      id: 'org-acme',
      name: 'Acme Corp',
      initials: 'AC',
      domain: 'acmecorp.com',
      badge: 'Primary',
      color: '#10B981',
      members: 6,
      plan: 'Enterprise',
      region: 'USA',
      lastAccess: 'Active now',
      complianceTags: ['SOC2', 'ISO27001', 'GDPR']
    },
    {
      id: 'org-beta',
      name: 'Beta LLC',
      initials: 'BL',
      domain: 'betallc.com',
      badge: 'Sandbox',
      color: '#F97316',
      members: 3,
      plan: 'Business',
      region: 'UK',
      lastAccess: '2 hours ago',
      complianceTags: ['GDPR']
    },
    {
      id: 'org-gamma',
      name: 'Gamma Inc',
      initials: 'GI',
      domain: 'gammainc.com',
      badge: '',
      color: '#8B5CF6',
      members: 2,
      plan: 'Business',
      region: 'Japan',
      lastAccess: 'Yesterday',
      complianceTags: ['ISO27001']
    }
  ];

  readonly filteredOrgs = computed(() => {
    const q = this.orgSearchQuery.toLowerCase();
    if (!q) return this.sampleOrgs;
    return this.sampleOrgs.filter(o =>
      o.name.toLowerCase().includes(q) ||
      o.domain.toLowerCase().includes(q) ||
      o.region.toLowerCase().includes(q)
    );
  });

  // ── Password strength ─────────────────────────────────────────
  get passwordStrengthClass(): string {
    const pw: string = this.changePasswordForm.get('newPassword')?.value ?? '';
    const score = this.calcPasswordScore(pw);
    if (score <= 1) return 'strength-weak';
    if (score === 2) return 'strength-fair';
    if (score === 3) return 'strength-good';
    return 'strength-strong';
  }

  get passwordStrengthLabel(): string {
    const pw: string = this.changePasswordForm.get('newPassword')?.value ?? '';
    const score = this.calcPasswordScore(pw);
    if (score <= 1) return 'AUTH.STRENGTH_WEAK';
    if (score === 2) return 'AUTH.STRENGTH_FAIR';
    if (score === 3) return 'AUTH.STRENGTH_GOOD';
    return 'AUTH.STRENGTH_STRONG';
  }

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
    const code = this.mfaCodeValue;
    if (code.length < 6) return;
    this.store.verifyMfa(code);
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
