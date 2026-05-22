import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';

export interface ModalStep {
  label: string;  // i18n key e.g. 'USERS.STEP_1'
  icon: string;   // mat-icon ligature e.g. 'person'
}

@Component({
  selector: 'asms-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule, TranslatePipe],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class AsmsModalComponent {
  @Input() title = '';
  @Input() steps: ModalStep[] = [];   // empty array = no step indicator (simple dialog)
  @Input() currentStep = 0;           // 0-based index
  @Input() isLoading = false;
  @Input() canProceed = true;         // controls Next/Submit enabled state
  @Input() isFirstStep = true;
  @Input() isLastStep = false;
  @Input() submitLabel = 'COMMON.SUBMIT';  // i18n key

  @Output() cancelled  = new EventEmitter<void>();
  @Output() backed     = new EventEmitter<void>();
  @Output() nexted     = new EventEmitter<void>();
  @Output() submitted  = new EventEmitter<void>();
}
