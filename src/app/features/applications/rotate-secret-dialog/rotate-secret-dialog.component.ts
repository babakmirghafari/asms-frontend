import { Component, computed, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppMock } from '../app-mock.model';

export interface RotateSecretDialogData {
  app: AppMock;
}

@Component({
  selector: 'asms-rotate-secret-dialog',
  templateUrl: './rotate-secret-dialog.component.html',
  styleUrl: './rotate-secret-dialog.component.scss',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    TranslateModule
  ]
})
export class RotateSecretDialogComponent {
  readonly data: RotateSecretDialogData = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<RotateSecretDialogComponent>);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  readonly checklist = signal([false, false, false]);
  readonly allChecked = computed(() => this.checklist().every(Boolean));

  toggle(i: number): void {
    this.checklist.update(prev => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
  }

  rotate(): void {
    if (!this.allChecked()) return;
    this.snackBar.open(
      this.translate.instant('APPLICATIONS.SECRET_ROTATED', { name: this.data.app.name }),
      this.translate.instant('COMMON.CLOSE'),
      { duration: 4000, panelClass: 'snackbar-success' }
    );
    this.dialogRef.close({ rotated: true });
  }

  cancel(): void {
    this.dialogRef.close(null);
  }
}
