import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StationPoliciesStore } from './station-policies.store';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusChipComponent } from '../../shared/components/status-chip/status-chip.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import {
  StationPolicyFormDialogComponent,
  StationPolicyFormDialogData,
  StationPolicyFormResult
} from './station-policy-form-dialog/station-policy-form-dialog.component';
import { StationPolicyDto, CreateStationPolicyRequestDto, UpdateStationPolicyRequestDto } from '@babakmirghafari/asms-api-client';

@Component({
  selector: 'asms-station-policies',
  templateUrl: './station-policies.component.html',
  styleUrl: './station-policies.component.scss',
  standalone: true,
  imports: [
    DatePipe,
    MatTableModule, MatButtonModule, MatIconModule, MatMenuModule,
    MatProgressSpinnerModule, MatPaginatorModule, MatDividerModule,
    TranslateModule,
    PageHeaderComponent, StatusChipComponent
  ]
})
export class StationPoliciesComponent implements OnInit {
  protected readonly store = inject(StationPoliciesStore);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  readonly displayedColumns = ['name', 'description', 'status', 'workStartTime', 'createdAt', 'actions'];

  ngOnInit(): void {
    this.store.loadAll();
  }

  onPage(event: PageEvent): void {
    this.store.loadAll(event.pageIndex, event.pageSize);
  }

  openCreateDialog(): void {
    const data: StationPolicyFormDialogData = { isEdit: false };
    this.dialog
      .open(StationPolicyFormDialogComponent, { data, width: '560px', disableClose: true })
      .afterClosed()
      .subscribe((result: StationPolicyFormResult | null) => {
        if (!result) return;
        this.store.create(result as CreateStationPolicyRequestDto).then(() => {
          this.snackBar.open(
            this.translate.instant('STATION_POLICIES.CREATED_SUCCESS'),
            this.translate.instant('COMMON.CLOSE'),
            { duration: 4000, panelClass: 'snackbar-success' }
          );
        });
      });
  }

  openEditDialog(policy: StationPolicyDto): void {
    const data: StationPolicyFormDialogData = { policy, isEdit: true };
    this.dialog
      .open(StationPolicyFormDialogComponent, { data, width: '560px', disableClose: true })
      .afterClosed()
      .subscribe((result: StationPolicyFormResult | null) => {
        if (!result) return;
        this.store.update(policy.id, result as UpdateStationPolicyRequestDto).then(() => {
          this.snackBar.open(
            this.translate.instant('STATION_POLICIES.UPDATED_SUCCESS'),
            this.translate.instant('COMMON.CLOSE'),
            { duration: 4000, panelClass: 'snackbar-success' }
          );
        });
      });
  }

  confirmDelete(policy: StationPolicyDto): void {
    const data: ConfirmDialogData = {
      titleKey: 'STATION_POLICIES.DELETE_TITLE',
      messageKey: 'STATION_POLICIES.DELETE_CONFIRM',
      messageParams: { name: policy.name },
      dangerous: true,
      confirmKey: 'COMMON.DELETE'
    };
    this.dialog.open(ConfirmDialogComponent, { data }).afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.store.delete(policy.id).then(() => {
          this.snackBar.open(
            this.translate.instant('STATION_POLICIES.DELETED_SUCCESS'),
            this.translate.instant('COMMON.CLOSE'),
            { duration: 3000, panelClass: 'snackbar-success' }
          );
        });
      }
    });
  }
}
