import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { AsmsModalComponent } from '../../../shared/components/modal/modal.component';
import {
  StationPolicyDto,
  CreateStationPolicyRequestDto,
  UpdateStationPolicyRequestDto
} from '@babakmirghafari/asms-api-client';

export interface StationPolicyFormDialogData {
  policy?: StationPolicyDto;
  isEdit: boolean;
}

export type StationPolicyFormResult = CreateStationPolicyRequestDto | UpdateStationPolicyRequestDto;

@Component({
  selector: 'asms-station-policy-form-dialog',
  templateUrl: './station-policy-form-dialog.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    TranslateModule,
    AsmsModalComponent
  ]
})
export class StationPolicyFormDialogComponent {
  readonly data: StationPolicyFormDialogData = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<StationPolicyFormDialogComponent>);
  private readonly fb = inject(FormBuilder);

  isLoading = false;

  readonly weekDays = [
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' },
    { value: 7, label: 'Sun' }
  ];

  readonly allowedDays: boolean[] = (() => {
    const existing = this.data.policy?.allowedDays ?? [1, 2, 3, 4, 5];
    return this.weekDays.map(d => existing.includes(d.value));
  })();

  readonly form = this.fb.group({
    name: [this.data.policy?.name ?? '', [Validators.required, Validators.minLength(2)]],
    description: [this.data.policy?.description ?? ''],
    organizationId: [
      '',
      this.data.isEdit ? [] : [Validators.required]
    ],
    allowedIpRanges: [
      this.data.policy?.allowedIpRanges?.join('\n') ?? ''
    ],
    workStartTime: [this.data.policy?.workStartTime ?? '08:00'],
    workEndTime: [this.data.policy?.workEndTime ?? '18:00']
  });

  toggleDay(index: number): void {
    this.allowedDays[index] = !this.allowedDays[index];
  }

  cancel(): void {
    this.dialogRef.close(null);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const ipRaw = this.form.value.allowedIpRanges?.trim();
    const allowedIpRanges = ipRaw
      ? ipRaw.split('\n').map(ip => ip.trim()).filter(Boolean)
      : undefined;

    const allowedDays = this.weekDays
      .filter((_, i) => this.allowedDays[i])
      .map(d => d.value);

    if (this.data.isEdit) {
      const dto: UpdateStationPolicyRequestDto = {
        name: this.form.value.name!,
        description: this.form.value.description ?? undefined,
        allowedIpRanges,
        allowedDays,
        workStartTime: this.form.value.workStartTime ?? undefined,
        workEndTime: this.form.value.workEndTime ?? undefined
      };
      this.dialogRef.close(dto);
    } else {
      const dto: CreateStationPolicyRequestDto = {
        name: this.form.value.name!,
        description: this.form.value.description ?? undefined,
        organizationId: this.form.value.organizationId!,
        allowedIpRanges,
        allowedDays,
        workStartTime: this.form.value.workStartTime ?? undefined,
        workEndTime: this.form.value.workEndTime ?? undefined
      };
      this.dialogRef.close(dto);
    }
  }
}
