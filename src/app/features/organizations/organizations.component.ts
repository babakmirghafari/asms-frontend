import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { DatePipe, DecimalPipe, SlicePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { debounceTime } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OrganizationsStore } from './organizations.store';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusChipComponent } from '../../shared/components/status-chip/status-chip.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { OrgFormDialogComponent, OrgFormDialogData } from './org-form-dialog/org-form-dialog.component';
import { OrganizationDto, CreateOrganizationRequestDto } from '@babakmirghafari/asms-api-client';

@Component({
  selector: 'asms-organizations',
  templateUrl: './organizations.component.html',
  styleUrl: './organizations.component.scss',
  standalone: true,
  imports: [
    DatePipe, DecimalPipe, SlicePipe,
    ReactiveFormsModule,
    MatTableModule, MatButtonModule, MatIconModule, MatMenuModule,
    MatFormFieldModule, MatInputModule, MatProgressSpinnerModule, MatPaginatorModule,
    MatDividerModule, MatTooltipModule,
    TranslateModule,
    PageHeaderComponent, StatusChipComponent
  ]
})
export class OrganizationsComponent implements OnInit {
  protected readonly store = inject(OrganizationsStore);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);
  private readonly fb = inject(FormBuilder);

  readonly displayedColumns = ['name', 'description', 'status', 'createdAt', 'actions'];
  readonly searchCtrl = this.fb.control('');
  readonly searchTerm = signal('');

  readonly filteredItems = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.store.items();
    return this.store.items().filter(o =>
      o.name?.toLowerCase().includes(term) ||
      o.description?.toLowerCase().includes(term)
    );
  });

  constructor() {
    this.searchCtrl.valueChanges.pipe(
      debounceTime(300),
      takeUntilDestroyed()
    ).subscribe(val => this.searchTerm.set(val ?? ''));
  }

  ngOnInit(): void {
    this.store.loadAll();
  }

  onPage(event: PageEvent): void {
    this.store.loadAll(event.pageIndex, event.pageSize);
  }

  openCreateDialog(): void {
    const data: OrgFormDialogData = { isEdit: false };
    this.dialog
      .open(OrgFormDialogComponent, { data, width: 'min(560px, 95vw)', maxWidth: '95vw', disableClose: true })
      .afterClosed()
      .subscribe((dto: CreateOrganizationRequestDto | null) => {
        if (!dto) return;
        this.store.create(dto)
          .then(() => this.snackBar.open(
            this.translate.instant('ORGANIZATIONS.CREATED_SUCCESS'),
            this.translate.instant('COMMON.CLOSE'),
            { duration: 4000, panelClass: 'snackbar-success' }
          ))
          .catch(() => this.snackBar.open(
            this.translate.instant('COMMON.ERROR'),
            this.translate.instant('COMMON.CLOSE'),
            { duration: 4000, panelClass: 'snackbar-error' }
          ));
      });
  }

  openEditDialog(org: OrganizationDto): void {
    const data: OrgFormDialogData = { org, isEdit: true };
    this.dialog
      .open(OrgFormDialogComponent, { data, width: 'min(560px, 95vw)', maxWidth: '95vw', disableClose: true })
      .afterClosed()
      .subscribe((dto: CreateOrganizationRequestDto | null) => {
        if (!dto) return;
        // Map CreateOrganizationRequestDto to UpdateOrganizationRequestDto
        this.store.update(org.id, { name: dto.name, description: dto.description })
          .then(() => this.snackBar.open(
            this.translate.instant('ORGANIZATIONS.UPDATED_SUCCESS'),
            this.translate.instant('COMMON.CLOSE'),
            { duration: 4000, panelClass: 'snackbar-success' }
          ))
          .catch(() => this.snackBar.open(
            this.translate.instant('COMMON.ERROR'),
            this.translate.instant('COMMON.CLOSE'),
            { duration: 4000, panelClass: 'snackbar-error' }
          ));
      });
  }

  confirmDelete(org: OrganizationDto): void {
    const data: ConfirmDialogData = {
      titleKey: 'ORGANIZATIONS.DELETE_TITLE',
      messageKey: 'ORGANIZATIONS.DELETE_CONFIRM',
      messageParams: { name: org.name },
      dangerous: true,
      confirmKey: 'COMMON.DELETE'
    };
    this.dialog.open(ConfirmDialogComponent, { data, width: 'min(440px, 95vw)', maxWidth: '95vw' }).afterClosed().subscribe(confirmed => {
      if (!confirmed) return;
      this.store.delete(org.id)
        .then(() => this.snackBar.open(
          this.translate.instant('ORGANIZATIONS.DELETED_SUCCESS'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 4000, panelClass: 'snackbar-success' }
        ))
        .catch(() => this.snackBar.open(
          this.translate.instant('COMMON.ERROR'),
          this.translate.instant('COMMON.CLOSE'),
          { duration: 4000, panelClass: 'snackbar-error' }
        ));
    });
  }
}
