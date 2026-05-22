import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AlertsStore } from './alerts.store';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusChipComponent } from '../../shared/components/status-chip/status-chip.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { AlertDto } from '@babakmirghafari/asms-api-client';

@Component({
  selector: 'asms-alerts',
  templateUrl: './alerts.component.html',
  styleUrl: './alerts.component.scss',
  standalone: true,
  imports: [
    DatePipe,
    MatTableModule, MatButtonModule, MatIconModule, MatMenuModule,
    MatProgressSpinnerModule, MatPaginatorModule,
    TranslateModule,
    PageHeaderComponent, StatusChipComponent
  ]
})
export class AlertsComponent implements OnInit {
  protected readonly store = inject(AlertsStore);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  readonly displayedColumns = ['alertType', 'severity', 'status', 'riskScore', 'actorUsername', 'ipAddress', 'createdAt', 'actions'];

  ngOnInit(): void {
    this.store.loadAll();
  }

  onPage(event: PageEvent): void {
    this.store.loadAll(event.pageIndex, event.pageSize);
  }

  confirmAcknowledge(alert: AlertDto): void {
    const data: ConfirmDialogData = {
      titleKey: 'ALERTS.ACKNOWLEDGE_TITLE',
      messageKey: 'ALERTS.ACKNOWLEDGE_CONFIRM',
      confirmKey: 'ALERTS.ACKNOWLEDGE'
    };
    this.dialog.open(ConfirmDialogComponent, { data, width: '440px' }).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.store.acknowledge(alert.id).then(() => {
        this.snackBar.open(
          this.translate.instant('ALERTS.ACKNOWLEDGED_SUCCESS'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000, panelClass: 'snackbar-success' }
        );
      });
    });
  }

  confirmResolve(alert: AlertDto): void {
    const data: ConfirmDialogData = {
      titleKey: 'ALERTS.RESOLVE_TITLE',
      messageKey: 'ALERTS.RESOLVE_CONFIRM',
      confirmKey: 'ALERTS.RESOLVE'
    };
    this.dialog.open(ConfirmDialogComponent, { data, width: '440px' }).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.store.resolve(alert.id).then(() => {
        this.snackBar.open(
          this.translate.instant('ALERTS.RESOLVED_SUCCESS'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 3000, panelClass: 'snackbar-success' }
        );
      });
    });
  }
}
