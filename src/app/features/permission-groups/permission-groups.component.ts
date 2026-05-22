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
import { PermissionGroupsStore } from './permission-groups.store';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusChipComponent } from '../../shared/components/status-chip/status-chip.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { PermissionGroupDto } from '@babakmirghafari/asms-api-client';

@Component({
  selector: 'asms-permission-groups',
  templateUrl: './permission-groups.component.html',
  styleUrl: './permission-groups.component.scss',
  standalone: true,
  imports: [
    DatePipe,
    MatTableModule, MatButtonModule, MatIconModule, MatMenuModule,
    MatProgressSpinnerModule, MatPaginatorModule,
    TranslateModule,
    PageHeaderComponent, StatusChipComponent
  ]
})
export class PermissionGroupsComponent implements OnInit {
  protected readonly store = inject(PermissionGroupsStore);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  readonly displayedColumns = ['name', 'description', 'status', 'memberCount', 'permissionCount', 'actions'];

  ngOnInit(): void {
    this.store.loadAll();
  }

  onPage(event: PageEvent): void {
    this.store.loadAll(event.pageIndex, event.pageSize);
  }

  confirmDelete(group: PermissionGroupDto): void {
    const data: ConfirmDialogData = {
      titleKey: 'PERMISSION_GROUPS.DELETE_TITLE',
      messageKey: 'PERMISSION_GROUPS.DELETE_CONFIRM',
      messageParams: { name: group.name },
      dangerous: true,
      confirmKey: 'COMMON.DELETE'
    };
    this.dialog.open(ConfirmDialogComponent, { data }).afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.store.delete(group.id).then(() => {
          this.snackBar.open(
            this.translate.instant('PERMISSION_GROUPS.DELETE') + ' OK',
            this.translate.instant('COMMON.CLOSE'),
            { duration: 3000 }
          );
        });
      }
    });
  }
}
