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
import { MembershipsStore } from './memberships.store';
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
    MatTableModule, MatButtonModule, MatIconModule, MatMenuModule,
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
    const data: ConfirmDialogData = {
      titleKey: 'MEMBERSHIPS.DELETE_TITLE',
      messageKey: 'MEMBERSHIPS.DELETE_CONFIRM',
      dangerous: true,
      confirmKey: 'COMMON.DELETE'
    };
    this.dialog.open(ConfirmDialogComponent, { data, width: 'min(440px, 95vw)', maxWidth: '95vw' }).afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.store.delete(membership.id).then(() => {
          this.snackBar.open(
            this.translate.instant('MEMBERSHIPS.DELETED_SUCCESS'),
            this.translate.instant('COMMON.CLOSE'),
            { duration: 3000, panelClass: 'snackbar-success' }
          );
        });
      }
    });
  }
}
