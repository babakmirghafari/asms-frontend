import { Component, inject, signal } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { PermissionsStore } from '../permissions.store';
import {
  PermissionImportValidateResponseDto,
  PermissionImportCommitResponseDto
} from '@babakmirghafari/asms-api-client';

@Component({
  selector: 'asms-permission-import-dialog',
  templateUrl: './permission-import-dialog.component.html',
  styleUrl: './permission-import-dialog.component.scss',
  standalone: true,
  imports: [
    MatDialogModule, MatStepperModule, MatButtonModule, MatIconModule,
    MatTableModule, MatProgressSpinnerModule, TranslateModule
  ]
})
export class PermissionImportDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<PermissionImportDialogComponent>);
  protected readonly store = inject(PermissionsStore);

  readonly currentStep = signal(0);
  readonly selectedFile = signal<File | null>(null);
  readonly importId = signal<string | null>(null);
  readonly validateResponse = signal<PermissionImportValidateResponseDto | null>(null);
  readonly commitResponse = signal<PermissionImportCommitResponseDto | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly issueColumns = ['lineNumber', 'severity', 'field', 'message', 'rawValue'];

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile.set(input.files[0]);
      this.error.set(null);
    }
  }

  downloadTemplate(): void {
    const header = 'name,resource,action,description\n';
    const blob = new Blob([header], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'permissions-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  async validate(): Promise<void> {
    const file = this.selectedFile();
    if (!file) return;
    this.loading.set(true);
    this.error.set(null);
    try {
      const response = await this.store.validateImport(file, '');
      this.importId.set(response.importId as unknown as string);
      this.validateResponse.set(response);
      this.currentStep.set(1);
    } catch {
      this.error.set('PERMISSIONS.IMPORT_ERROR');
    } finally {
      this.loading.set(false);
    }
  }

  async commit(): Promise<void> {
    const id = this.importId();
    if (!id) return;
    this.loading.set(true);
    this.error.set(null);
    try {
      const response = await this.store.commitImport(id);
      this.commitResponse.set(response);
      this.currentStep.set(2);
    } catch {
      this.error.set('PERMISSIONS.IMPORT_ERROR');
    } finally {
      this.loading.set(false);
    }
  }

  back(): void {
    this.currentStep.set(0);
  }

  close(): void {
    this.store.loadAll();
    this.dialogRef.close();
  }

  get isReady(): boolean {
    return this.validateResponse()?.status === 'READY';
  }
}
