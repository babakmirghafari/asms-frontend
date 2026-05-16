import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AccessControlStore } from './access-control.store';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { AccessControlSimulateRequestDto } from '@babakmirghafari/asms-api-client';

@Component({
  selector: 'asms-access-control',
  standalone: true,
  imports: [ReactiveFormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatProgressSpinnerModule, MatChipsModule, MatSnackBarModule, PageHeaderComponent],
  providers: [AccessControlStore],
  templateUrl: './access-control.component.html',
  styleUrl: './access-control.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccessControlComponent {
  readonly store = inject(AccessControlStore);
  private snack  = inject(MatSnackBar);
  private fb     = inject(FormBuilder);

  lookupForm = this.fb.group({ userId: ['', Validators.required], organizationId: ['default', Validators.required] });

  simForm = this.fb.group({
    userId: ['', Validators.required],
    organizationId: ['default', Validators.required],
    resource: ['', Validators.required],
    action: ['READ' as AccessControlSimulateRequestDto.ActionEnum, Validators.required],
  });

  readonly actionOptions: AccessControlSimulateRequestDto.ActionEnum[] = ['READ', 'WRITE', 'DELETE', 'ADMIN'];

  async lookup() {
    if (this.lookupForm.invalid) { this.lookupForm.markAllAsTouched(); return; }
    await this.store.loadEffective(this.lookupForm.value.userId!, this.lookupForm.value.organizationId!);
    this.showErr();
  }

  async simulate() {
    if (this.simForm.invalid) { this.simForm.markAllAsTouched(); return; }
    await this.store.simulate(this.simForm.value as AccessControlSimulateRequestDto);
    this.showErr();
  }

  private showErr() { const e = this.store.error(); if (e) { this.snack.open(e, 'Dismiss', { duration: 5000 }); this.store.clearError(); } }
}
