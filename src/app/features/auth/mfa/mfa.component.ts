import { Component, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthStore } from '../../../core/store/auth.store';

@Component({
  selector: 'asms-mfa',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './mfa.component.html',
  styleUrl: './mfa.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MfaComponent {
  private router = inject(Router);
  readonly authStore = inject(AuthStore);

  readonly year = new Date().getFullYear();
  readonly userEmail = 'admin@northwind.com';
  readonly loading = signal(false);
  readonly error   = signal<string | null>(null);

  form: FormGroup = inject(FormBuilder).group({});
  private digits: string[] = ['', '', '', '', '', ''];

  getDigit(i: number): string { return this.digits[i]; }
  isComplete(): boolean { return this.digits.every(d => d.length === 1); }

  onDigitInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const val = input.value.replace(/\D/g, '').slice(-1);
    this.digits[index] = val;
    input.value = val;
    if (val && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  }

  onKeydown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace' && !this.digits[index] && index > 0) {
      this.digits[index - 1] = '';
      const prev = document.getElementById(`otp-${index - 1}`) as HTMLInputElement;
      if (prev) { prev.value = ''; prev.focus(); }
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const text = event.clipboardData?.getData('text') ?? '';
    const nums = text.replace(/\D/g, '').slice(0, 6);
    nums.split('').forEach((ch, i) => {
      this.digits[i] = ch;
      const el = document.getElementById(`otp-${i}`) as HTMLInputElement;
      if (el) el.value = ch;
    });
    const nextFocus = Math.min(nums.length, 5);
    document.getElementById(`otp-${nextFocus}`)?.focus();
  }

  async onVerify(): Promise<void> {
    if (!this.isComplete()) return;
    this.loading.set(true);
    this.error.set(null);
    // MFA verification would call authStore.verifyMfa() — stub for now
    await new Promise(r => setTimeout(r, 800));
    this.loading.set(false);
    this.router.navigate(['/dashboard']);
  }

  goBack(event: Event): void {
    event.preventDefault();
    this.router.navigate(['/auth/login']);
  }
}
