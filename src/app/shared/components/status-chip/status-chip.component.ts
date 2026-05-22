import { Component, Input, computed, signal } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'asms-status-chip',
  templateUrl: './status-chip.component.html',
  styleUrl: './status-chip.component.scss',
  standalone: true,
  imports: [MatChipsModule]
})
export class StatusChipComponent {
  @Input() set status(val: string) { this._status.set((val ?? '').toUpperCase()); }

  private readonly _status = signal('');

  readonly cssClass = computed(() => {
    const s = this._status();
    const map: Record<string, string> = {
      'ACTIVE': 'chip-active',
      'INACTIVE': 'chip-inactive',
      'LOCKED': 'chip-locked',
      'SUSPENDED': 'chip-suspended',
      'TEMP_PASSWORD': 'chip-inactive',
      'PENDING_MFA_ENROLLMENT': 'chip-inactive',
      'CRITICAL': 'chip-critical',
      'HIGH': 'chip-high',
      'MEDIUM': 'chip-medium',
      'LOW': 'chip-low',
      'OPEN': 'chip-open',
      'ACKNOWLEDGED': 'chip-acknowledged',
      'RESOLVED': 'chip-resolved',
      'SUPPRESSED': 'chip-inactive',
      'ESCALATED': 'chip-critical',
      'INVESTIGATING': 'chip-medium',
      'ENABLED': 'chip-active',
      'DISABLED': 'chip-inactive'
    };
    return map[s] ?? 'chip-inactive';
  });

  readonly displayText = computed(() => this._status());
}
