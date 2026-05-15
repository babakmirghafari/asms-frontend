import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'asms-form-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './form-dialog.component.html',
  styleUrl: './form-dialog.component.scss',
})
export class FormDialogComponent {
  // TODO(angular-logic-implementer): inject MAT_DIALOG_DATA and MatDialogRef,
  // add MatDialogModule + MatButtonModule + NgTemplateOutlet imports, implement dialog wrapper
}
