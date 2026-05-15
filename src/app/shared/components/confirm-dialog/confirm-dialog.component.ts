import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
}

@Component({
  selector: 'asms-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
})
export class ConfirmDialogComponent {
  // TODO(angular-logic-implementer): inject MAT_DIALOG_DATA and MatDialogRef,
  // add MatDialogModule + MatButtonModule imports, implement full dialog
  data: ConfirmDialogData = { title: '', message: '' };
}
