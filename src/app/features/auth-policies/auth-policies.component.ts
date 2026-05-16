import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UpdateAuthPolicyRequestDto } from '@babakmirghafari/asms-api-client';
import { AuthPoliciesStore } from './auth-policies.store';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'asms-auth-policies',
  standalone: true,
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatCheckboxModule, MatButtonModule, MatProgressSpinnerModule, MatSnackBarModule, PageHeaderComponent],
  providers: [AuthPoliciesStore],
  templateUrl: './auth-policies.component.html',
  styleUrl: './auth-policies.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthPoliciesComponent implements OnInit {
  readonly store = inject(AuthPoliciesStore);
  private snack  = inject(MatSnackBar);
  private fb     = inject(FormBuilder);
  readonly orgId = 'default';

  form = this.fb.group({
    mfaRequired: [false],
    passwordMinLength: [8],
    passwordRequiresUppercase: [true],
    passwordRequiresNumber: [true],
    passwordRequiresSpecial: [false],
    maxFailedLoginAttempts: [5],
    sessionTimeoutMinutes: [60],
  });

  async ngOnInit() {
    await this.store.loadByOrg(this.orgId);
    const p = this.store.selected();
    if (p) this.form.patchValue(p);
    this.showErr();
  }

  async save() {
    const p = this.store.selected();
    if (!p) return;
    const r = await this.store.update(p.id, this.form.value as UpdateAuthPolicyRequestDto);
    if (r) this.snack.open('Policy saved', 'Close', { duration: 3000 }); else this.showErr();
  }

  private showErr() { const e = this.store.error(); if (e) { this.snack.open(e, 'Dismiss', { duration: 5000 }); this.store.clearError(); } }
}
