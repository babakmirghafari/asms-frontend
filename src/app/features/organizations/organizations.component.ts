import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { DatePipe, SlicePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { debounceTime } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { OrganizationsStore } from './organizations.store';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusChipComponent } from '../../shared/components/status-chip/status-chip.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { OrgFormDialogComponent, OrgFormDialogData } from './org-form-dialog/org-form-dialog.component';
import { OrgSettingsDialogComponent, OrgSettingsDialogData } from './org-settings-dialog/org-settings-dialog.component';
import { OrgMembersPanelComponent, OrgMembersPanelData } from './org-members-panel/org-members-panel.component';
import { OrganizationDto, OrganizationSettingsDto, CreateOrganizationRequestDto, UpdateOrganizationRequestDto } from '@babakmirghafari/asms-api-client';
import {UsersStore} from "../users/users.store";

@Component({
  selector: 'asms-organizations',
  templateUrl: './organizations.component.html',
  styleUrl: './organizations.component.scss',
  standalone: true,
  imports: [
    DatePipe, SlicePipe,
    ReactiveFormsModule,
    MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatProgressSpinnerModule, MatPaginatorModule,
    MatDividerModule,
    TranslateModule,
    PageHeaderComponent, StatusChipComponent,
    OrgMembersPanelComponent
  ]
})
export class OrganizationsComponent implements OnInit {
  protected readonly store = inject(OrganizationsStore);
  protected readonly userStore = inject(UsersStore);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);
  private readonly fb = inject(FormBuilder);

  private static readonly AVATAR_COLORS = [
    '#4CAF50', '#FF9800', '#9C27B0', '#00BCD4',
    '#3F51B5', '#F44336', '#009688', '#FF5722', '#795548', '#607D8B'
  ];

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
    this.userStore.loadAll();
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
      .subscribe((dto: UpdateOrganizationRequestDto | null) => {
        if (!dto) return;
        this.store.update(org.id, { name: dto.name, description: dto.description, logoUrl: dto.logoUrl })
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

  getInitials(name: string): string {
    return (name ?? '').split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase();
  }

  getAvatarColor(name: string): string {
    const idx = (name?.charCodeAt(0) ?? 0) % OrganizationsComponent.AVATAR_COLORS.length;
    return OrganizationsComponent.AVATAR_COLORS[idx];
  }

  getOrgSettings(orgId: string): OrganizationSettingsDto | undefined {
    return this.store.settingsMap()[orgId];
  }

  private static readonly IDP_LABELS: Record<string, string> = {
    OKTA: 'Okta', AZURE_AD: 'Azure AD', GOOGLE_WORKSPACE: 'Google Workspace',
    AUTH0: 'Auth0', ONE_LOGIN: 'OneLogin', PING_IDENTITY: 'Ping Identity',
  };

  getIdpLabel(idp: string | undefined): string | undefined {
    return idp ? (OrganizationsComponent.IDP_LABELS[idp] ?? idp) : undefined;
  }

  openMembersDialog(org: OrganizationDto): void {
    const data: OrgMembersPanelData = {
      org,
      avatarColor: this.getAvatarColor(org.name),
      initials: this.getInitials(org.name)
    };
    this.dialog
      .open(OrgMembersPanelComponent, {
        data,
        position: { right: '0', top: '0' },
        height: '100vh',
        width: '580px',
        maxWidth: '95vw',
        panelClass: 'settings-sidebar-panel',
        enterAnimationDuration: '200ms',
        exitAnimationDuration: '150ms'
      })
      .afterClosed()
      .subscribe(() => this.store.loadAll(this.store.pageIndex(), this.store.pageSize()));
  }

  openSettings(org: OrganizationDto): void {
    const data: OrgSettingsDialogData = {
      org,
      avatarColor: this.getAvatarColor(org.name),
      initials:    this.getInitials(org.name)
    };
    this.dialog
      .open(OrgSettingsDialogComponent, {
        data,
        position:              { right: '0', top: '0' },
        height:                '100vh',
        width:                 '540px',
        maxWidth:              '95vw',
        panelClass:            'settings-sidebar-panel',
        enterAnimationDuration: '200ms',
        exitAnimationDuration:  '150ms'
      })
      .afterClosed()
      .subscribe((result: 'saved' | 'deleted' | 'suspended' | 'activated' | null) => {
        if (result === 'deleted' || result === 'suspended' || result === 'activated' || result === 'saved') {
          this.store.loadAll(this.store.pageIndex(), this.store.pageSize());
        }
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
