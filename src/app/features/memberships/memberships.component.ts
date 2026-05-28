import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MembershipsStore, LastActiveMembershipError } from './memberships.store';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusChipComponent } from '../../shared/components/status-chip/status-chip.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import {
  MembershipFormDialogComponent,
  MembershipFormDialogData
} from './membership-form-dialog/membership-form-dialog.component';
import { MembershipDto, CreateMembershipRequestDto } from '@babakmirghafari/asms-api-client';

@Component({
  selector: 'asms-memberships',
  templateUrl: './memberships.component.html',
  styleUrl: './memberships.component.scss',
  standalone: true,
  imports: [
    DatePipe,
    MatTableModule, MatButtonModule, MatIconModule, MatTooltipModule,
    MatProgressSpinnerModule, MatPaginatorModule,
    TranslateModule,
    PageHeaderComponent, StatusChipComponent
  ]
})
export class MembershipsComponent implements OnInit {
  protected readonly store = inject(MembershipsStore);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  readonly displayedColumns = ['username', 'organizationName', 'status', 'createdAt', 'actions'];

  ngOnInit(): void {
    this.store.loadAll();
  }

  onPage(event: PageEvent): void {
    this.store.loadAll(event.pageIndex, event.pageSize);
  }

  openCreateDialog(): void {
    const data: MembershipFormDialogData = {};
    this.dialog
      .open(MembershipFormDialogComponent, { data, width: 'min(480px, 95vw)', maxWidth: '95vw', disableClose: true })
      .afterClosed()
      .subscribe((result: CreateMembershipRequestDto | null) => {
        if (!result) return;
        this.store.create(result).then(() => {
          this.snackBar.open(
            this.translate.instant('MEMBERSHIPS.CREATED_SUCCESS'),
            this.translate.instant('COMMON.CLOSE'),
            { duration: 4000, panelClass: 'snackbar-success' }
          );
        });
      });
  }

  confirmDelete(membership: MembershipDto): void {
    const confirmData: ConfirmDialogData = {
      titleKey: 'MEMBERSHIPS.REMOVE_CONFIRM_TITLE',
      messageKey: 'MEMBERSHIPS.REMOVE_CONFIRM_MESSAGE',
      dangerous: true,
      confirmKey: 'COMMON.REMOVE'
    };
    this.dialog
      .open(ConfirmDialogComponent, { data: confirmData, width: 'min(440px, 95vw)', maxWidth: '95vw' })
      .afterClosed()
      .subscribe(confirmed => {
        if (!confirmed) return;
        this.store.delete(membership.id!).then(() => {
          this.snackBar.open(
            this.translate.instant('MEMBERSHIPS.REMOVED_SUCCESS'),
            this.translate.instant('COMMON.CLOSE'),
            { duration: 3000, panelClass: 'snackbar-success' }
          );
        }).catch((err: unknown) => {
          if (err instanceof LastActiveMembershipError) {
            const infoData: ConfirmDialogData = {
              titleKey: 'MEMBERSHIPS.LAST_ACTIVE_ERROR_TITLE',
              messageKey: 'MEMBERSHIPS.LAST_ACTIVE_ERROR_MESSAGE',
              dangerous: false,
              confirmKey: 'COMMON.CLOSE',
              cancelKey: 'COMMON.CLOSE'
            };
            this.dialog.open(ConfirmDialogComponent, {
              data: infoData,
              width: 'min(480px, 95vw)',
              maxWidth: '95vw',
              disableClose: false
            });
          } else {
            const msg = err instanceof Error ? err.message : this.translate.instant('COMMON.ERROR');
            this.snackBar.open(msg, this.translate.instant('COMMON.CLOSE'), {
              duration: 5000,
              panelClass: 'snackbar-error'
            });
          }
        });
      });
  }
}
