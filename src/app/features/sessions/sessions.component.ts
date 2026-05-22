import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SessionsStore } from './sessions.store';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusChipComponent } from '../../shared/components/status-chip/status-chip.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { SessionDto } from '@babakmirghafari/asms-api-client';

@Component({
  selector: 'asms-sessions',
  templateUrl: './sessions.component.html',
  styleUrl: './sessions.component.scss',
  standalone: true,
  imports: [
    DatePipe,
    MatTableModule, MatButtonModule, MatIconModule, MatMenuModule,
    MatProgressSpinnerModule, MatPaginatorModule, MatTooltipModule,
    TranslateModule,
    PageHeaderComponent, StatusChipComponent
  ]
})
export class SessionsComponent implements OnInit {
  protected readonly store = inject(SessionsStore);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  readonly displayedColumns = ['username', 'organizationName', 'ipAddress', 'status', 'mfaVerified', 'riskScore', 'lastActivityAt', 'actions'];

  ngOnInit(): void {
    this.store.loadAll();
  }

  onPage(event: PageEvent): void {
    this.store.loadAll(event.pageIndex, event.pageSize);
  }

  confirmRevoke(session: SessionDto): void {
    const data: ConfirmDialogData = {
      titleKey: 'SESSIONS.REVOKE_TITLE',
      messageKey: 'SESSIONS.REVOKE_CONFIRM',
      dangerous: true,
      confirmKey: 'COMMON.REVOKE'
    };
    this.dialog.open(ConfirmDialogComponent, { data }).afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.store.revoke(session.id).then(() => {
          this.snackBar.open(
            this.translate.instant('SESSIONS.REVOKE_SUCCESS'),
            this.translate.instant('COMMON.CLOSE'),
            { duration: 3000, panelClass: 'snackbar-success' }
          );
        });
      }
    });
  }

  confirmRevokeAll(): void {
    const data: ConfirmDialogData = {
      titleKey: 'SESSIONS.REVOKE_TITLE',
      messageKey: 'SESSIONS.REVOKE_ALL_CONFIRM',
      dangerous: true,
      confirmKey: 'SESSIONS.REVOKE_ALL'
    };
    this.dialog.open(ConfirmDialogComponent, { data, width: 'min(440px, 95vw)', maxWidth: '95vw' }).afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.store.revokeAll('').then(() => {
          this.snackBar.open(
            this.translate.instant('SESSIONS.REVOKE_ALL_SUCCESS'),
            this.translate.instant('COMMON.CLOSE'),
            { duration: 4000, panelClass: 'snackbar-success' }
          );
          this.store.loadAll();
        });
      }
    });
  }
}
