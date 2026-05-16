import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthStore } from '@core/store/auth.store';

@Component({
  selector: 'asms-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent implements OnInit {
  private fb     = inject(FormBuilder);
  private router = inject(Router);
  private snack  = inject(MatSnackBar);
  readonly authStore = inject(AuthStore);

  readonly year = new Date().getFullYear();

  form: FormGroup = this.fb.group({
    username:       ['', [Validators.required, Validators.minLength(3)]],
    password:       ['', [Validators.required, Validators.minLength(6)]],
    rememberDevice: [false],
  });

  hidePassword = true;

  ngOnInit(): void {
    if (this.authStore.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onForgotPassword(event: Event): void {
    event.preventDefault();
    this.snack.open('Password reset link will be sent to your registered email.', 'OK', { duration: 4000 });
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const { username, password } = this.form.value;
    await this.authStore.login({ username, password });
    const step  = this.authStore.step();
    const error = this.authStore.error();
    if (error) { return; } // error shown inline via authStore.error()
    if (step === 'authenticated')      this.router.navigate(['/dashboard']);
    else if (step === 'mfa')           this.router.navigate(['/auth/mfa']);
    else if (step === 'org-select')    this.router.navigate(['/auth/select-organization']);
    else if (step === 'temp-password') this.router.navigate(['/auth/change-password']);
  }
}
