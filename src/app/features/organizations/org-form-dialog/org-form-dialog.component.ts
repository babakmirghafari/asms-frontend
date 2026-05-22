import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material/divider';
import { TranslateModule } from '@ngx-translate/core';
import { OrganizationDto, CreateOrganizationRequestDto } from '@babakmirghafari/asms-api-client';

export interface OrgFormDialogData {
  org?: OrganizationDto;
  isEdit: boolean;
}

/** Avatar background colours to cycle through for new orgs */
const AVATAR_COLORS = ['#3f51b5', '#009688', '#f57c00', '#7b1fa2', '#c62828', '#2e7d32'];

@Component({
  selector: 'asms-org-form-dialog',
  templateUrl: './org-form-dialog.component.html',
  styleUrl: './org-form-dialog.component.scss',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatSlideToggleModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatDividerModule,
    TranslateModule
  ]
})
export class OrgFormDialogComponent {
  readonly data: OrgFormDialogData = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<OrgFormDialogComponent>);
  private readonly fb = inject(FormBuilder);

  isLoading = false;

  /** Compliance tag options */
  readonly complianceTags = ['SOC2', 'ISO 27001', 'GDPR', 'HIPAA'];
  selectedTags: string[] = [];

  /** Avatar color derived from name or random */
  private colorIndex = Math.floor(Math.random() * AVATAR_COLORS.length);

  get avatarColor(): string {
    return AVATAR_COLORS[this.colorIndex % AVATAR_COLORS.length];
  }

  get nameInitial(): string {
    return (this.form.get('name')?.value?.trim()?.[0] ?? 'O').toUpperCase();
  }

  readonly form = this.fb.group({
    name: [this.data.org?.name ?? '', [Validators.required, Validators.minLength(2)]],
    description: [this.data.org?.description ?? ''],
    orgCode: ['', [Validators.pattern(/^[A-Z0-9-]*$/)]],
    status: ['ACTIVE'],
    dataResidency: ['EU'],
    adminEmail: ['', [Validators.email]],
    website: ['', [Validators.pattern(/^(https?:\/\/.+)?$/)]],
    useGlobalAuthPolicy: [true],
    useGlobalStationPolicy: [true]
  });

  constructor() {
    // Auto-generate org code from name
    this.form.get('name')?.valueChanges.subscribe(val => {
      const code = (val ?? '')
        .trim()
        .toUpperCase()
        .replace(/\s+/g, '-')
        .replace(/[^A-Z0-9-]/g, '');
      this.form.get('orgCode')?.setValue(code, { emitEvent: false });
      // Cycle avatar color based on first letter code point
      this.colorIndex = (val?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length;
    });
  }

  isTagSelected(tag: string): boolean {
    return this.selectedTags.includes(tag);
  }

  toggleTag(tag: string): void {
    const idx = this.selectedTags.indexOf(tag);
    if (idx >= 0) {
      this.selectedTags = this.selectedTags.filter(t => t !== tag);
    } else {
      this.selectedTags = [...this.selectedTags, tag];
    }
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
      name: this.form.value.name!,
      description: this.form.value.description?.trim() || undefined
      // Additional fields (orgCode, dataResidency, compliance, adminEmail) would go
      // into extended DTO fields when backend supports them
    };

    this.dialogRef.close(dto);
  }
}
