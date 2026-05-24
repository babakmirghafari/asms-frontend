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
  OrganizationDto, CreateOrganizationRequestDto,
  UsersService, UserSummaryDto, PagedResponseDto
} from '@babakmirghafari/asms-api-client';
import { AsmsModalComponent } from '../../../shared/components/modal/modal.component';

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

  isLoading = false;
  logoPreviewUrl: string | null = this.data.org?.logoUrl ?? null;

  readonly users = signal<UserSummaryDto[]>([]);
  readonly usersLoading = signal(false);

  readonly plans = [
    { value: 'STARTER',      label: 'Starter' },
    { value: 'PROFESSIONAL', label: 'Professional' },
    { value: 'ENTERPRISE',   label: 'Enterprise' }
  ];

  readonly form = this.fb.group({
    name:        [this.data.org?.name ?? '',        [Validators.required, Validators.minLength(2)]],
    domain:      ['',                               [Validators.required, Validators.pattern(/^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/)]],
    description: [this.data.org?.description ?? ''],
    plan:        ['STARTER'],
    country:     [''],
    ownerUserId: ['']
  });

  ngOnInit(): void {
    this.loadUsers();
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

    const dto: CreateOrganizationRequestDto = {
      name:        this.form.value.name!,
      description: this.form.value.description?.trim() || undefined,
      logoUrl:     this.logoPreviewUrl ?? undefined
    };

    this.dialogRef.close(dto);
  }
}
