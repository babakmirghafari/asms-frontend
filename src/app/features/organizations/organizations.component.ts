import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
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
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { debounceTime } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OrganizationsStore } from './organizations.store';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusChipComponent } from '../../shared/components/status-chip/status-chip.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { OrganizationDto } from '@babakmirghafari/asms-api-client';

@Component({
  selector: 'asms-organizations',
  templateUrl: './organizations.component.html',
  styleUrl: './organizations.component.scss',
  standalone: true,
  imports: [
    DatePipe,
    ReactiveFormsModule,
    MatTableModule, MatButtonModule, MatIconModule, MatMenuModule,
    MatFormFieldModule, MatInputModule, MatProgressSpinnerModule, MatPaginatorModule,
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

  constructor() {
    this.searchCtrl.valueChanges.pipe(
      debounceTime(300),
      takeUntilDestroyed()
    ).subscribe(() => this.store.loadAll(0, 20));
  }

  ngOnInit(): void {
    this.store.loadAll();
  }

  onPage(event: PageEvent): void {
    this.store.loadAll(event.pageIndex, event.pageSize);
  }

  confirmDelete(org: OrganizationDto): void {
    const data: ConfirmDialogData = {
      titleKey: 'ORGANIZATIONS.DELETE_TITLE',
      messageKey: 'ORGANIZATIONS.DELETE_CONFIRM',
      messageParams: { name: org.name },
      dangerous: true,
      confirmKey: 'COMMON.DELETE'
    };
    this.dialog.open(ConfirmDialogComponent, { data }).afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.store.delete(org.id).then(() => {
          this.snackBar.open(
            this.translate.instant('ORGANIZATIONS.DELETE') + ' OK',
            this.translate.instant('COMMON.CLOSE'),
            { duration: 3000 }
          );
        });
      }
    });
  }
}
