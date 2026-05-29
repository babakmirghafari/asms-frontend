import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { LowerCasePipe } from '@angular/common';
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
    LowerCasePipe,
    MatTableModule, MatButtonModule, MatIconModule, MatTooltipModule,
    MatProgressSpinnerModule, MatPaginatorModule,
    TranslateModule,
    PageHeaderComponent, ConfirmDialogComponent
  ]
})
export class MembershipsComponent implements OnInit {
  protected readonly store = inject(MembershipsStore);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  readonly displayedColumns = ['user', 'organizations', 'status', 'actions'];

  readonly pageIndex = signal(0);
  readonly pageSize  = signal(10);

  readonly pagedRows = computed(() => {
    const start = this.pageIndex() * this.pageSize();
    return this.store.userRows().slice(start, start + this.pageSize());
  });

  private static readonly AVATAR_COLORS = [
    '#4CAF50', '#FF9800', '#9C27B0', '#00BCD4',
    '#3F51B5', '#F44336', '#009688', '#FF5722'
  ];

  ngOnInit(): void {
    this.store.loadAll();
  }

  avatarColor(name: string): string {
    return MembershipsComponent.AVATAR_COLORS[(name?.charCodeAt(0) ?? 0) % MembershipsComponent.AVATAR_COLORS.length];
  }

  initials(name: string): string {
    return (name ?? '').split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase() || '?';
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

  onPage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  confirmRemoveFromOrg(membership: MembershipDto): void {
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
