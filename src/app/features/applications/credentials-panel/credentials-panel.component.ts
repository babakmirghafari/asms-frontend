import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppMock } from '../app-mock.model';
import { RotateSecretDialogComponent } from '../rotate-secret-dialog/rotate-secret-dialog.component';

export interface CredentialsPanelData {
  app: AppMock;
}

@Component({
  selector: 'asms-credentials-panel',
  templateUrl: './credentials-panel.component.html',
  styleUrl: './credentials-panel.component.scss',
  standalone: true,
  imports: [
    DatePipe,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatChipsModule,
    MatDividerModule,
    TranslateModule
  ]
})
export class CredentialsPanelComponent {
  readonly data: CredentialsPanelData = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<CredentialsPanelComponent>);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  readonly secretRevealed = signal(false);

  readonly orgSlug = computed(() =>
    this.data.app.organizationName.toLowerCase().replace(/\s+/g, '-')
  );

  readonly issuer = computed(() =>
    `https://auth.asms.app/realms/${this.orgSlug()}`
  );

  readonly quickstart = computed(() => {
    const { clientId, redirectUris } = this.data.app;
    const redirectUri = redirectUris[0] ?? '';
    const orgSlug = this.orgSlug();
    return `# OIDC discovery
curl https://auth.asms.app/realms/${orgSlug}/.well-known/openid-configuration

# Exchange auth code for token
curl -X POST https://auth.asms.app/oauth2/token \\
  -d "grant_type=authorization_code" \\
  -d "code=$CODE" \\
  -d "client_id=${clientId}" \\
  -d "client_secret=$SECRET" \\
  -d "redirect_uri=${redirectUri}"`;
  });

  readonly endpoints = computed(() => [
    { label: 'APPLICATIONS.AUTHORIZATION_URL', value: 'https://auth.asms.app/oauth2/authorize' },
    { label: 'APPLICATIONS.TOKEN_URL', value: 'https://auth.asms.app/oauth2/token' },
    { label: 'APPLICATIONS.USERINFO_URL', value: 'https://auth.asms.app/oauth2/userinfo' },
    { label: 'APPLICATIONS.JWKS_URL', value: 'https://auth.asms.app/.well-known/jwks.json' },
    { label: 'APPLICATIONS.ISSUER', value: this.issuer() }
  ]);

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      this.snackBar.open(
        this.translate.instant('APPLICATIONS.COPIED'),
        '',
        { duration: 2000 }
      );
    });
  }

  toggleSecret(): void {
    this.secretRevealed.update(v => !v);
  }

  openRotateSecret(): void {
    this.dialog.open(RotateSecretDialogComponent, {
      data: { app: this.data.app },
      width: 'min(520px, 95vw)',
      maxWidth: '95vw',
      disableClose: false
    });
  }

  downloadEnv(): void {
    const { clientId, redirectUris } = this.data.app;
    const content = `CLIENT_ID=${clientId}\nCLIENT_SECRET=<your-secret>\nREDIRECT_URI=${redirectUris[0] ?? ''}\nISSUER=${this.issuer()}\n`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${clientId}.env`;
    a.click();
    URL.revokeObjectURL(url);
  }

  close(): void {
    this.dialogRef.close();
  }
}
