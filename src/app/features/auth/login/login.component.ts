import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthStore } from '../../../core/store/auth.store';

@Component({
  selector: 'asms-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
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
  private fb      = inject(FormBuilder);
  private router  = inject(Router);
  private snack   = inject(MatSnackBar);
  readonly authStore = inject(AuthStore);

  form: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  hidePassword = true;

  ngOnInit(): void {
    if (this.authStore.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    await this.authStore.login(this.form.value);
    const step  = this.authStore.step();
    const error = this.authStore.error();
    if (error) {
      this.snack.open(error, 'Dismiss', { duration: 5000, panelClass: 'snack-error' });
      this.authStore.clearError();
      return;
    }
    if (step === 'authenticated')  this.router.navigate(['/dashboard']);
    else if (step === 'mfa')       this.router.navigate(['/auth/mfa']);
    else if (step === 'org-select') this.router.navigate(['/auth/select-organization']);
    else if (step === 'temp-password') this.router.navigate(['/auth/change-password']);
  }
}
