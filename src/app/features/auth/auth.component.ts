import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { AuthFeatureStore } from './auth.store';
import { AuthStore } from '../../core/store/auth.store';

@Component({
  selector: 'asms-auth',
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
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

  readonly changePasswordForm = this.fb.group({
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required]
  });

  showPassword = false;

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

  backToLogin(): void {
    this.store.resetToLogin();
  }
}
