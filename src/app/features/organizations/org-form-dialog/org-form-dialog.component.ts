import { Component, inject, signal, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import {
  OrganizationDto, CreateOrganizationRequestDto, UpdateOrganizationRequestDto,
  UsersService, UserSummaryDto, PagedResponseDto,
  OrganizationsService
} from '@babakmirghafari/asms-api-client';
import { AsmsModalComponent } from '../../../shared/components/modal';

export interface OrgFormDialogData {
  org?: OrganizationDto;
  isEdit: boolean;
}

@Component({
  selector: 'asms-org-form-dialog',
  templateUrl: './org-form-dialog.component.html',
  styleUrl: './org-form-dialog.component.scss',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslateModule,
    AsmsModalComponent
  ]
})
export class OrgFormDialogComponent implements OnInit {
  readonly data: OrgFormDialogData = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<OrgFormDialogComponent>);
  private readonly fb = inject(FormBuilder);
  private readonly usersService = inject(UsersService);
  private readonly orgsService = inject(OrganizationsService);

  isLoading = false;
  logoPreviewUrl: string | null = this.data.org?.logoUrl ?? null;

  readonly users = signal<UserSummaryDto[]>([]);
  readonly usersLoading = signal(false);

  readonly organizations = signal<OrganizationDto[]>([]);
  readonly orgsLoading = signal(false);

  readonly plans = [
    { value: 'Starter',      label: 'Starter' },
    { value: 'Professional', label: 'Professional' },
    { value: 'Enterprise',   label: 'Enterprise' }
  ];

  readonly form = this.fb.group({
    name:                 [this.data.org?.name ?? '',       [Validators.required, Validators.minLength(2)]],
    domain:               [this.data.org?.domain ?? '',     this.data.isEdit ? [] : [Validators.required, Validators.pattern(/^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/)]],
    description:          [this.data.org?.description ?? ''],
    plan:                 ['Starter'],
    country:              [''],
    ownerUserId:          [''],
    parentOrganizationId: [this.data.org?.parentOrganizationId ?? null]
  });

  ngOnInit(): void {
    this.loadUsers();
    this.loadOrganizations();
  }

  private async loadOrganizations(): Promise<void> {
    this.orgsLoading.set(true);
    try {
      const res = await firstValueFrom(this.orgsService.listOrganizations(0, 200)) as PagedResponseDto;
      const all = res.content as OrganizationDto[];
      // exclude the current org from the parent dropdown to prevent self-reference
      this.organizations.set(this.data.org?.id ? all.filter(o => o.id !== this.data.org!.id) : all);
    } catch {
      // non-critical — parent dropdown stays empty
    } finally {
      this.orgsLoading.set(false);
    }
  }

  private async loadUsers(): Promise<void> {
    this.usersLoading.set(true);
    try {
      const res = await firstValueFrom(this.usersService.listUsers(0, 100, 'ACTIVE')) as PagedResponseDto;
      this.users.set(res.content as UserSummaryDto[]);
    } catch {
      // non-critical — owner dropdown stays empty
    } finally {
      this.usersLoading.set(false);
    }
  }

  onLogoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { this.logoPreviewUrl = reader.result as string; };
    reader.readAsDataURL(file);
  }

  cancel(): void {
    this.dialogRef.close(null);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;

    if (this.data.isEdit) {
      const dto: UpdateOrganizationRequestDto = {
        name:        value.name!,
        description: value.description?.trim() || undefined,
        logoUrl:     this.logoPreviewUrl ?? undefined,
      };
      this.dialogRef.close(dto);
    } else {
      const dto: CreateOrganizationRequestDto = {
        name:                 value.name!,
        domain:               value.domain?.trim() || undefined,
        description:          value.description?.trim() || undefined,
        plan:                 (value.plan as CreateOrganizationRequestDto.PlanEnum) || undefined,
        country:              value.country?.trim() || undefined,
        ownerUserId:          value.ownerUserId || undefined,
        parentOrganizationId: value.parentOrganizationId || undefined,
        logoUrl:              this.logoPreviewUrl ?? undefined,
      };
      this.dialogRef.close(dto);
    }
  }
}
