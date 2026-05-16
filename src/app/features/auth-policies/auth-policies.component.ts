import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

interface PolicyConfig {
  mfaRequired: boolean;
  passwordMinLength: number;
  passwordRequiresUppercase: boolean;
  passwordRequiresNumber: boolean;
  passwordRequiresSpecial: boolean;
  maxFailedLoginAttempts: number;
  sessionTimeoutMinutes: number;
  tokenExpiryMinutes: number;
  rememberDeviceDays: number;
  allowedIpRanges: string;
  enforcePasswordHistory: number;
}

@Component({
  selector: 'asms-auth-policies',
  standalone: true,
  imports: [
    FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatCheckboxModule,
    MatButtonModule, MatIconModule,
    PageHeaderComponent,
  ],
  templateUrl: './auth-policies.component.html',
  styleUrl: './auth-policies.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthPoliciesComponent {

  readonly saving = signal(false);
  readonly saved = signal(false);

  policy = signal<PolicyConfig>({
    mfaRequired: true,
    passwordMinLength: 12,
    passwordRequiresUppercase: true,
    passwordRequiresNumber: true,
    passwordRequiresSpecial: true,
    maxFailedLoginAttempts: 5,
    sessionTimeoutMinutes: 60,
    tokenExpiryMinutes: 480,
    rememberDeviceDays: 30,
    allowedIpRanges: '0.0.0.0/0',
    enforcePasswordHistory: 5,
  });

  updatePolicy(partial: Partial<PolicyConfig>): void {
    this.policy.update(p => ({ ...p, ...partial }));
  }

  save(): void {
    this.saving.set(true);
    setTimeout(() => {
      this.saving.set(false);
      this.saved.set(true);
      setTimeout(() => this.saved.set(false), 3000);
    }, 800);
  }
}
