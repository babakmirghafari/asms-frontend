import { Component, OnInit, inject, signal } from '@angular/core';
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

  private static readonly ORG_COLORS = [
    '#10B981', '#F97316', '#8B5CF6', '#3B82F6',
    '#EF4444', '#06B6D4', '#F59E0B', '#84CC16'
  ];

  private toOrgItem(raw: { id: string; name: string; slug: string; domain: string; memberCount: number; plan: string }): OrgItem {
    const name = raw.name ?? '';
    const words = name.trim().split(/\s+/);
    const initials = words.length >= 2
      ? (words[0][0] + words[words.length - 1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase();
    const colorIdx = name.charCodeAt(0) % AuthComponent.ORG_COLORS.length;
    return {
      id: raw.id,
      name,
      initials,
      domain: raw.domain ?? raw.slug ?? '',
      badge: '',
      color: AuthComponent.ORG_COLORS[colorIdx],
      members: raw.memberCount ?? 0,
      plan: raw.plan ?? '',
      region: '',
      lastAccess: '',
      complianceTags: []
    };
  }

  get realOrgs(): OrgItem[] {
    return this.store.orgsForSelection().map(o => this.toOrgItem(o));
  }

  get filteredOrgs(): OrgItem[] {
    const q = this.orgSearchQuery.toLowerCase();
    const orgs = this.realOrgs;
    if (!q) return orgs;
    return orgs.filter(o =>
      o.name.toLowerCase().includes(q) ||
      o.domain.toLowerCase().includes(q)
    );
  }

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
