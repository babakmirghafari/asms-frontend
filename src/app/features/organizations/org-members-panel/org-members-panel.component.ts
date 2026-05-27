import { Component, OnInit, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { LowerCasePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';
import { MembershipsService, UsersService, MembershipDto, UserSummaryDto, OrganizationDto } from '@babakmirghafari/asms-api-client';
import { AddMemberDialogComponent, AddMemberDialogData } from './add-member-dialog/add-member-dialog.component';

export interface OrgMembersPanelData {
  org: OrganizationDto;
  avatarColor: string;
  initials: string;
}

@Component({
  selector: 'asms-org-members-panel',
  templateUrl: './org-members-panel.component.html',
  styleUrl: './org-members-panel.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    LowerCasePipe,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslateModule
  ]
})
export class OrgMembersPanelComponent implements OnInit {
  readonly data: OrgMembersPanelData = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<OrgMembersPanelComponent>);
  private readonly dialog = inject(MatDialog);
  private readonly membershipsService = inject(MembershipsService);
  private readonly usersService = inject(UsersService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  private static readonly AVATAR_COLORS = [
    '#4CAF50', '#FF9800', '#9C27B0', '#00BCD4',
    '#3F51B5', '#F44336', '#009688', '#FF5722', '#795548', '#607D8B'
  ];

  readonly members = signal<MembershipDto[]>([]);
  readonly allUsers = signal<UserSummaryDto[]>([]);
  readonly isLoading = signal(true);
  readonly isAdding = signal(false);

  readonly memberCount = computed(() => this.members().length);

  readonly eligibleUsers = computed(() =>
    this.allUsers().filter(u => !this.members().some(m => m.userId === u.id))
  );

  async ngOnInit(): Promise<void> {
    try {
      const [membersResp, usersResp] = await Promise.all([
        firstValueFrom(this.membershipsService.listMemberships(0, 200, undefined, this.data.org.id)),
        firstValueFrom(this.usersService.listUsers(0, 200))
      ]);
      this.members.set((membersResp.content ?? []) as MembershipDto[]);
      this.allUsers.set((usersResp.content ?? []) as UserSummaryDto[]);
    } catch {
      // backend unavailable — show empty state
    } finally {
      this.isLoading.set(false);
    }
  }

  openAddMemberDialog(): void {
    const data: AddMemberDialogData = {
      org: this.data.org,
      eligibleUsers: this.eligibleUsers()
    };
    this.dialog
      .open(AddMemberDialogComponent, {
        data,
        width: 'min(560px, 95vw)',
        maxWidth: '95vw',
        disableClose: false
      })
      .afterClosed()
      .subscribe((selected: UserSummaryDto[] | null) => {
        if (selected && selected.length > 0) {
          this.addMembers(selected);
        }
      });
  }

  async addMembers(selected: UserSummaryDto[]): Promise<void> {
    this.isAdding.set(true);
    try {
      for (const u of selected) {
        await firstValueFrom(
          this.membershipsService.createMembership({
            userId: u.id,
            organizationId: this.data.org.id
          })
        );
      }
      // Reload members after all calls complete
      const membersResp = await firstValueFrom(
        this.membershipsService.listMemberships(0, 200, undefined, this.data.org.id)
      );
      this.members.set((membersResp.content ?? []) as MembershipDto[]);
      this.snackBar.open(
        this.translate.instant('MEMBERSHIPS.CREATED_SUCCESS'),
        this.translate.instant('COMMON.CLOSE'),
        { duration: 4000, panelClass: 'snackbar-success' }
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred.';
      this.snackBar.open(
        msg,
        this.translate.instant('COMMON.CLOSE'),
        { duration: 4000, panelClass: 'snackbar-error' }
      );
    } finally {
      this.isAdding.set(false);
    }
  }

  close(): void {
    this.dialogRef.close();
  }

  getInitials(name: string): string {
    return (name ?? '').split(' ').slice(0, 2).map(w => w[0] ?? '').join('').toUpperCase();
  }

  getAvatarColor(name: string): string {
    const idx = (name?.charCodeAt(0) ?? 0) % OrgMembersPanelComponent.AVATAR_COLORS.length;
    return OrgMembersPanelComponent.AVATAR_COLORS[idx];
  }

  getDisplayName(m: MembershipDto): string {
    return m.username ?? 'Unknown';
  }
}
