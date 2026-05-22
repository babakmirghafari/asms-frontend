import { Component, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthPoliciesStore } from './auth-policies.store';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { AuthStore } from '../../core/store/auth.store';

@Component({
  selector: 'asms-auth-policies',
  templateUrl: './auth-policies.component.html',
  styleUrl: './auth-policies.component.scss',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatCheckboxModule,
    MatButtonModule, MatProgressSpinnerModule,
    TranslateModule,
    PageHeaderComponent
  ]
})
export class AuthPoliciesComponent implements OnInit {
  protected readonly store = inject(AuthPoliciesStore);
  private readonly authStore = inject(AuthStore);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    mfaRequired: [false],
    passwordMinLength: [8, [Validators.min(6), Validators.max(64)]],
    passwordRequiresUppercase: [true],
    passwordRequiresNumber: [true],
    passwordRequiresSpecial: [false],
    maxFailedLoginAttempts: [5, [Validators.min(1), Validators.max(20)]],
    sessionTimeoutMinutes: [60, [Validators.min(0)]]
  });

  ngOnInit(): void {
    this.store.loadCurrent();
    // Populate form when policy loads
    const checkInterval = setInterval(() => {
      const policy = this.store.current();
      if (policy) {
        clearInterval(checkInterval);
        this.form.patchValue({
          mfaRequired: policy.mfaRequired ?? false,
          passwordMinLength: policy.passwordMinLength ?? 8,
          passwordRequiresUppercase: policy.passwordRequiresUppercase ?? true,
          passwordRequiresNumber: policy.passwordRequiresNumber ?? true,
          passwordRequiresSpecial: policy.passwordRequiresSpecial ?? false,
          maxFailedLoginAttempts: policy.maxFailedLoginAttempts ?? 5,
          sessionTimeoutMinutes: policy.sessionTimeoutMinutes ?? 60
        });
      }
    }, 100);
    setTimeout(() => clearInterval(checkInterval), 5000);
  }

  save(): void {
    if (this.form.invalid) return;
    const orgId = this.authStore.organizationId() ?? '';
    const dto = {
      mfaRequired: this.form.value.mfaRequired ?? false,
      passwordMinLength: this.form.value.passwordMinLength ?? 8,
      passwordRequiresUppercase: this.form.value.passwordRequiresUppercase ?? true,
      passwordRequiresNumber: this.form.value.passwordRequiresNumber ?? true,
      passwordRequiresSpecial: this.form.value.passwordRequiresSpecial ?? false,
      maxFailedLoginAttempts: this.form.value.maxFailedLoginAttempts ?? 5,
      sessionTimeoutMinutes: this.form.value.sessionTimeoutMinutes ?? 60
    };
    this.store.update(orgId, dto).then(() => {
      this.snackBar.open(
        this.translate.instant('COMMON.SAVE') + ' OK',
        this.translate.instant('COMMON.CLOSE'),
        { duration: 3000 }
      );
    });
  }
}
