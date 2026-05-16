import { Component, inject, Input, TemplateRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export interface FormDialogData {
  title: string;
  submitLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
}

@Component({
  selector: 'asms-form-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './form-dialog.component.html',
  styleUrl: './form-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormDialogComponent {
  data: FormDialogData = inject(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<FormDialogComponent>);

  @Input() loading = false;

  cancel(): void  { this.dialogRef.close(null); }
  submit(): void  { this.dialogRef.close('submit'); }
}
