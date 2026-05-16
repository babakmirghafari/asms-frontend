import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

export type ChipVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'critical';

@Component({
  selector: 'asms-status-chip',
  standalone: true,
  imports: [],
  templateUrl: './status-chip.component.html',
  styleUrl: './status-chip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusChipComponent {
  @Input() status = '';
  @Input() label?: string;
  /** Map from status value to variant. Falls back to 'neutral'. */
  @Input() statusMap: Record<string, ChipVariant> = {};

  get variant(): ChipVariant {
    return this.statusMap[this.status] ?? 'neutral';
  }

  get displayLabel(): string {
    return this.label ?? this.status.replace(/_/g, ' ');
  }
}
