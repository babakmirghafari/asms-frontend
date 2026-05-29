import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LowerCasePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { provideHttpClient } from '@angular/common/http';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideTranslateService } from '@ngx-translate/core';
import { MembershipsService, UsersService, MembershipDto, OrganizationDto } from '@babakmirghafari/asms-api-client';
import { OrgMembersPanelComponent, OrgMembersPanelData } from './org-members-panel.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeOrg = (): OrganizationDto => ({
  id: 'org-1',
  name: 'Test Org',
  status: 'ACTIVE' as OrganizationDto.StatusEnum,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
});

const makeMembership = (id: string): MembershipDto => ({
  id,
  userId: `user-${id}`,
  organizationId: 'org-1',
  status: MembershipDto.StatusEnum.Active,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
});

const fakeDialogRef = (closeValue: unknown) => ({
  afterClosed: () => of(closeValue),
  componentInstance: {},
  componentRef: null
});

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe('OrgMembersPanelComponent — removeMember', () => {
  let component: OrgMembersPanelComponent;
  let mockMembershipsService: jest.Mocked<Pick<MembershipsService, 'deleteMembership' | 'listMemberships' | 'createMembership'>>;
  let mockUsersService: jest.Mocked<Pick<UsersService, 'listUsers'>>;
  let mockPanelDialogRef: { close: jest.Mock };
  // These mocks are provided via useValue so the component gets them directly
  let mockDialog: { open: jest.Mock };
  let mockSnackBar: { open: jest.Mock };

  const panelData: OrgMembersPanelData = {
    org: makeOrg(),
    avatarColor: '#4CAF50',
    initials: 'TO'
  };

  beforeEach(async () => {
    mockMembershipsService = {
      listMemberships: jest.fn(),
      createMembership: jest.fn(),
      deleteMembership: jest.fn()
    };

    mockUsersService = {
      listUsers: jest.fn()
    };

    mockPanelDialogRef = { close: jest.fn() };

    // Use plain objects with jest.fn() so we control exactly what the component gets
    mockDialog = { open: jest.fn() };
    mockSnackBar = { open: jest.fn() };

    // ngOnInit makes two parallel calls — stub with empty responses
    mockMembershipsService.listMemberships.mockReturnValue(
      of({ content: [], totalElements: 0, page: 0, size: 200, totalPages: 0 } as any)
    );
    mockUsersService.listUsers.mockReturnValue(
      of({ content: [], totalElements: 0, page: 0, size: 200, totalPages: 0 } as any)
    );

    await TestBed.configureTestingModule({
      imports: [OrgMembersPanelComponent],
      providers: [
        provideNoopAnimations(),
        provideHttpClient(),
        provideTranslateService({ defaultLanguage: 'en' }),
        { provide: MAT_DIALOG_DATA, useValue: panelData },
        { provide: MatDialogRef, useValue: mockPanelDialogRef },
        { provide: MatDialog, useValue: mockDialog },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: MembershipsService, useValue: mockMembershipsService },
        { provide: UsersService, useValue: mockUsersService }
      ]
    })
    // OrgMembersPanelComponent imports ConfirmDialogComponent which brings in
    // MatDialogModule — that registers a second MatDialog instance in the
    // component injector that shadows our useValue mock. Strip the component
    // imports down to just the primitives so only our mock MatDialog is used.
    .overrideComponent(OrgMembersPanelComponent, {
      set: {
        imports: [
          LowerCasePipe,
          MatButtonModule,
          MatIconModule,
          MatProgressSpinnerModule,
          MatTooltipModule,
          TranslateModule
        ]
      }
    })
    .compileComponents();

    const fixture = TestBed.createComponent(OrgMembersPanelComponent);
    component = fixture.componentInstance;

    // Trigger ngOnInit and wait for async initialization
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Helper: seed members directly into the signal
  const seedMembers = (members: MembershipDto[]) => {
    component.members.set(members);
  };

  // -------------------------------------------------------------------------
  // Success path
  // -------------------------------------------------------------------------
  describe('removeMember — success path', () => {
    it('removes the member from members() and shows success snackbar', fakeAsync(() => {
      const m1 = makeMembership('m-1');
      const m2 = makeMembership('m-2');
      seedMembers([m1, m2]);

      mockDialog.open.mockReturnValueOnce(fakeDialogRef(true));
      mockMembershipsService.deleteMembership.mockReturnValue(of(undefined as any));

      component.removeMember(m1);
      tick();

      expect(component.members()).toHaveLength(1);
      expect(component.members()[0].id).toBe('m-2');
      expect(mockSnackBar.open).toHaveBeenCalledWith(
        expect.stringContaining('MEMBERSHIPS.REMOVED_SUCCESS'),
        expect.any(String),
        expect.objectContaining({ panelClass: 'snackbar-success' })
      );
    }));
  });

  // -------------------------------------------------------------------------
  // 409 guard violation
  // -------------------------------------------------------------------------
  describe('removeMember — 409 guard violation', () => {
    it('leaves members() unchanged and opens a blocking info dialog (no snackbar)', fakeAsync(() => {
      const m1 = makeMembership('m-1');
      seedMembers([m1]);

      // First call: confirm dialog returns true
      mockDialog.open.mockReturnValueOnce(fakeDialogRef(true));
      // Second call: info dialog
      mockDialog.open.mockReturnValueOnce(fakeDialogRef(undefined));

      const err = new HttpErrorResponse({ status: 409, error: { code: 'LAST_ACTIVE_MEMBERSHIP' } });
      mockMembershipsService.deleteMembership.mockReturnValue(throwError(() => err));

      component.removeMember(m1);
      tick();

      expect(component.members()).toHaveLength(1);
      expect(component.members()[0].id).toBe('m-1');

      expect(mockDialog.open).toHaveBeenCalledTimes(2);
      const secondCallArgs = (mockDialog.open as jest.Mock).mock.calls[1];
      expect(secondCallArgs[0]).toBe(ConfirmDialogComponent);
      const secondCallData = secondCallArgs[1]?.data;
      expect(secondCallData?.titleKey).toBe('MEMBERSHIPS.LAST_ACTIVE_ERROR_TITLE');
      expect(secondCallData?.messageKey).toBe('MEMBERSHIPS.LAST_ACTIVE_ERROR_MESSAGE');

      expect(mockSnackBar.open).not.toHaveBeenCalled();
    }));

    it('treats a plain 409 status (no error.code) as a guard violation', fakeAsync(() => {
      const m1 = makeMembership('m-1');
      seedMembers([m1]);

      mockDialog.open.mockReturnValueOnce(fakeDialogRef(true));
      mockDialog.open.mockReturnValueOnce(fakeDialogRef(undefined));

      const err = new HttpErrorResponse({ status: 409, error: {} });
      mockMembershipsService.deleteMembership.mockReturnValue(throwError(() => err));

      component.removeMember(m1);
      tick();

      expect(mockDialog.open).toHaveBeenCalledTimes(2);
      expect(mockSnackBar.open).not.toHaveBeenCalled();
    }));
  });

  // -------------------------------------------------------------------------
  // Cancelled confirmation
  // -------------------------------------------------------------------------
  describe('removeMember — cancelled confirmation', () => {
    it('does not call deleteMembership when confirm dialog returns false', fakeAsync(() => {
      const m1 = makeMembership('m-1');
      seedMembers([m1]);

      mockDialog.open.mockReturnValueOnce(fakeDialogRef(false));

      component.removeMember(m1);
      tick();

      expect(mockMembershipsService.deleteMembership).not.toHaveBeenCalled();
      expect(mockSnackBar.open).not.toHaveBeenCalled();
    }));

    it('does not call deleteMembership when confirm dialog returns undefined', fakeAsync(() => {
      const m1 = makeMembership('m-1');
      seedMembers([m1]);

      mockDialog.open.mockReturnValueOnce(fakeDialogRef(undefined));

      component.removeMember(m1);
      tick();

      expect(mockMembershipsService.deleteMembership).not.toHaveBeenCalled();
    }));
  });

  // -------------------------------------------------------------------------
  // memberCount reactivity
  // -------------------------------------------------------------------------
  describe('memberCount reactivity', () => {
    it('equals 3 before removal and 2 after a successful removeMember call', fakeAsync(() => {
      const m1 = makeMembership('m-1');
      const m2 = makeMembership('m-2');
      const m3 = makeMembership('m-3');
      seedMembers([m1, m2, m3]);

      expect(component.memberCount()).toBe(3);

      mockDialog.open.mockReturnValueOnce(fakeDialogRef(true));
      mockMembershipsService.deleteMembership.mockReturnValue(of(undefined as any));

      component.removeMember(m2);
      tick();

      expect(component.memberCount()).toBe(2);
    }));
  });
});
