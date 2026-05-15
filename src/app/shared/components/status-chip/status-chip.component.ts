import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'asms-status-chip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status-chip.component.html',
  styleUrl: './status-chip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusChipComponent {
  @Input() status = '';
  @Input() statusMap: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {};

  // TODO(angular-logic-implementer): add MatChipsModule, implement full badge system from §8.3
  get variant(): string {
    return this.statusMap[this.status] ?? 'neutral';
  }
}
