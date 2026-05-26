import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { LowerCasePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TranslateModule } from '@ngx-translate/core';
import { OrganizationDto, UserSummaryDto } from '@babakmirghafari/asms-api-client';

export interface AddMemberDialogData {
  org: OrganizationDto;
  eligibleUsers: UserSummaryDto[];
}

@Component({
  selector: 'asms-add-member-dialog',
  templateUrl: './add-member-dialog.component.html',
  styleUrl: './add-member-dialog.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LowerCasePipe,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    TranslateModule
  ]
})
export class AddMemberDialogComponent {
  readonly data: AddMemberDialogData = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<AddMemberDialogComponent>);

  private static readonly AVATAR_COLORS = [
    '#4CAF50', '#FF9800', '#9C27B0', '#00BCD4',
    '#3F51B5', '#F44336', '#009688', '#FF5722', '#795548', '#607D8B'
  ];

  readonly searchTerm = signal('');
  readonly selected = signal<Set<string>>(new Set());

  readonly filtered = computed(() => {
    const t = this.searchTerm().toLowerCase();
    if (!t) return this.data.eligibleUsers;
    return this.data.eligibleUsers.filter(u =>
      (u.displayName ?? '').toLowerCase().includes(t) ||
      u.username.toLowerCase().includes(t) ||
      u.email.toLowerCase().includes(t)
    );
  });

  readonly eligibleCount = computed(() => this.data.eligibleUsers.length);
  readonly selectedCount = computed(() => this.selected().size);
  readonly canAdd = computed(() => this.selected().size > 0);

  toggle(userId: string): void {
    const next = new Set(this.selected());
    if (next.has(userId)) {
      next.delete(userId);
    } else {
      next.add(userId);
    }
    this.selected.set(next);
  }

  confirm(): void {
    const selectedUsers = this.data.eligibleUsers.filter(u => this.selected().has(u.id));
    this.dialogRef.close(selectedUsers);
  }

  cancel(): void {
    this.dialogRef.close(null);
  }

  getInitials(name: string): string {
    return (name ?? '').split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase();
  }

  getAvatarColor(name: string): string {
    const idx = (name?.charCodeAt(0) ?? 0) % AddMemberDialogComponent.AVATAR_COLORS.length;
    return AddMemberDialogComponent.AVATAR_COLORS[idx];
  }
}
