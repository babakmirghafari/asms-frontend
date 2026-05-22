import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { AccessControlStore } from './access-control.store';
import { AccessControlSimulateRequestDto } from '@babakmirghafari/asms-api-client';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'asms-access-control',
  templateUrl: './access-control.component.html',
  styleUrl: './access-control.component.scss',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    TranslateModule,
    PageHeaderComponent
  ]
})
export class AccessControlComponent {
  protected readonly store = inject(AccessControlStore);
  private readonly fb = inject(FormBuilder);

  readonly simulateForm = this.fb.group({
    userId: ['', Validators.required],
    organizationId: ['', Validators.required],
    resource: ['', Validators.required],
    action: ['READ', Validators.required]
  });

  readonly actions = ['READ', 'WRITE', 'DELETE', 'ADMIN'];

  simulate(): void {
    if (this.simulateForm.invalid) return;
    const { userId, organizationId, resource, action } = this.simulateForm.value;
    this.store.simulate({
      userId: userId!,
      organizationId: organizationId!,
      resource: resource!,
      action: action as AccessControlSimulateRequestDto.ActionEnum
    });
  }

  clearResult(): void {
    this.store.clearResult();
    this.simulateForm.reset({ action: 'READ' });
  }
}
