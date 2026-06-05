import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppMock, MOCK_APPLICATIONS } from './app-mock.model';
import { AppFormDialogComponent, AppFormDialogData, AppFormResult } from './app-form-dialog/app-form-dialog.component';
import { RotateSecretDialogComponent } from './rotate-secret-dialog/rotate-secret-dialog.component';
import { CredentialsPanelComponent } from './credentials-panel/credentials-panel.component';

@Component({
  selector: 'asms-applications',
  templateUrl: './applications.component.html',
  styleUrl: './applications.component.scss',
  standalone: true,
  imports: [
    DatePipe,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    TranslateModule
  ]
})
export class ApplicationsComponent {
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  readonly items = signal<AppMock[]>(MOCK_APPLICATIONS);

  openCreateDialog(): void {
    const data: AppFormDialogData = { isEdit: false };
    this.dialog
      .open(AppFormDialogComponent, {
        data,
        width: 'min(560px, 95vw)',
        maxWidth: '95vw',
        disableClose: true
      })
      .afterClosed()
      .subscribe((result: AppFormResult | null) => {
        if (!result) return;
        const newApp: AppMock = {
          id: Date.now().toString(),
          name: result.name ?? '',
          clientId: result.clientId ?? '',
          type: result.type ?? 'confidential',
          organizationName: result.organizationName ?? '',
          organizationId: result.organizationId ?? '',
          createdAt: new Date().toISOString(),
          status: 'ACTIVE',
          redirectUris: result.redirectUris ?? [],
          allowedScopes: result.allowedScopes ?? ['openid', 'profile', 'email']
        };
        this.items.update(prev => [newApp, ...prev]);
        this.snackBar.open(
          this.translate.instant('APPLICATIONS.CREATED_SUCCESS'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 4000, panelClass: 'snackbar-success' }
        );
      });
  }

  openEditDialog(app: AppMock): void {
    const data: AppFormDialogData = { app, isEdit: true };
    this.dialog
      .open(AppFormDialogComponent, {
        data,
        width: 'min(560px, 95vw)',
        maxWidth: '95vw',
        disableClose: true
      })
      .afterClosed()
      .subscribe((result: AppFormResult | null) => {
        if (!result) return;
        this.items.update(prev =>
          prev.map(a => a.id === app.id ? { ...a, ...result } : a)
        );
        this.snackBar.open(
          this.translate.instant('APPLICATIONS.UPDATED_SUCCESS'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 4000, panelClass: 'snackbar-success' }
        );
      });
  }

  openRotateSecretDialog(app: AppMock): void {
    this.dialog.open(RotateSecretDialogComponent, {
      data: { app },
      width: 'min(520px, 95vw)',
      maxWidth: '95vw',
      disableClose: false
    });
  }

  openCredentialsPanel(app: AppMock): void {
    this.dialog.open(CredentialsPanelComponent, {
      data: { app },
      position: { right: '0', top: '0' },
      height: '100vh',
      width: '560px',
      panelClass: 'credentials-panel',
      hasBackdrop: true
    });
  }
}
