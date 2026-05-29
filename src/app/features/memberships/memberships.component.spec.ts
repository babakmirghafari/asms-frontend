import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideTranslateService } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { MembershipsComponent } from './memberships.component';
import { MembershipsStore, LastActiveMembershipError } from './memberships.store';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { MembershipDto } from '@babakmirghafari/asms-api-client';

const makeMembership = (id: string): MembershipDto => ({
  id,
  userId: `user-${id}`,
  organizationId: 'org-1',
  status: MembershipDto.StatusEnum.Active,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
});

// Produce a minimal MatDialogRef-like object whose afterClosed() emits the given value
const fakeDialogRef = (closeValue: unknown) => ({
  afterClosed: () => of(closeValue),
  componentInstance: {},
  componentRef: null
});

describe('MembershipsComponent — confirmDelete', () => {
  let component: MembershipsComponent;
  let dialogSpy: jest.SpyInstance;
  let snackBarSpy: jest.SpyInstance;
  let storeSpy: {
    delete: jest.Mock;
    loadAll: jest.Mock;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MembershipsComponent],
      providers: [
        provideNoopAnimations(),
        provideRouter([]),
        provideHttpClient(),
        provideTranslateService({ defaultLanguage: 'en' })
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(MembershipsComponent);
    component = fixture.componentInstance;

    // Spy on the real injected services AFTER component creation
    const dialog = TestBed.inject(MatDialog);
    const snackBar = TestBed.inject(MatSnackBar);
    const store = TestBed.inject(MembershipsStore);

    dialogSpy = jest.spyOn(dialog, 'open');
    snackBarSpy = jest.spyOn(snackBar, 'open');
    storeSpy = {
      delete: jest.spyOn(store, 'delete' as any) as jest.Mock,
      loadAll: jest.spyOn(store, 'loadAll' as any).mockResolvedValue(undefined) as jest.Mock
    };

    fixture.detectChanges();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // -------------------------------------------------------------------------
  // Success path
  // -------------------------------------------------------------------------
  describe('success path', () => {
    it('shows MEMBERSHIPS.REMOVED_SUCCESS snackbar when delete resolves', fakeAsync(() => {
      const membership = makeMembership('m-1');

      // First call — confirm dialog returns true
      dialogSpy.mockReturnValueOnce(fakeDialogRef(true));
      storeSpy.delete.mockResolvedValue(undefined);

      component.confirmDelete(membership);
      tick();

      expect(storeSpy.delete).toHaveBeenCalledWith('m-1');
      expect(snackBarSpy).toHaveBeenCalledWith(
        expect.stringContaining('MEMBERSHIPS.REMOVED_SUCCESS'),
        expect.any(String),
        expect.objectContaining({ panelClass: 'snackbar-success' })
      );
    }));
  });

  // -------------------------------------------------------------------------
  // 409 guard violation
  // -------------------------------------------------------------------------
  describe('409 guard violation', () => {
    it('opens a blocking info dialog (not a snackbar) when store.delete throws LastActiveMembershipError', fakeAsync(() => {
      const membership = makeMembership('m-1');

      // First call — confirm dialog returns true
      dialogSpy.mockReturnValueOnce(fakeDialogRef(true));
      // Second call — info dialog
      dialogSpy.mockReturnValueOnce(fakeDialogRef(undefined));

      storeSpy.delete.mockRejectedValue(new LastActiveMembershipError());

      component.confirmDelete(membership);
      tick();

      // dialog.open was called twice
      expect(dialogSpy).toHaveBeenCalledTimes(2);
      const secondCallArgs = dialogSpy.mock.calls[1];
      expect(secondCallArgs[0]).toBe(ConfirmDialogComponent);
      const secondCallData = secondCallArgs[1]?.data;
      expect(secondCallData?.titleKey).toBe('MEMBERSHIPS.LAST_ACTIVE_ERROR_TITLE');
      expect(secondCallData?.messageKey).toBe('MEMBERSHIPS.LAST_ACTIVE_ERROR_MESSAGE');

      // No snackbar for a 409
      expect(snackBarSpy).not.toHaveBeenCalled();
    }));
  });

  // -------------------------------------------------------------------------
  // Cancelled confirmation
  // -------------------------------------------------------------------------
  describe('cancelled confirmation', () => {
    it('does not call store.delete when confirm dialog returns false', fakeAsync(() => {
      const membership = makeMembership('m-1');

      dialogSpy.mockReturnValueOnce(fakeDialogRef(false));

      component.confirmDelete(membership);
      tick();

      expect(storeSpy.delete).not.toHaveBeenCalled();
      expect(snackBarSpy).not.toHaveBeenCalled();
    }));

    it('does not call store.delete when confirm dialog returns undefined', fakeAsync(() => {
      const membership = makeMembership('m-1');

      dialogSpy.mockReturnValueOnce(fakeDialogRef(undefined));

      component.confirmDelete(membership);
      tick();

      expect(storeSpy.delete).not.toHaveBeenCalled();
    }));
  });

  // -------------------------------------------------------------------------
  // Generic error
  // -------------------------------------------------------------------------
  describe('generic error', () => {
    it('shows error snackbar (not a second dialog) when store.delete throws a non-409 Error', fakeAsync(() => {
      const membership = makeMembership('m-1');

      dialogSpy.mockReturnValueOnce(fakeDialogRef(true));
      storeSpy.delete.mockRejectedValue(new Error('Some generic failure'));

      component.confirmDelete(membership);
      tick();

      // Only one dialog.open call (confirm dialog only, no info dialog)
      expect(dialogSpy).toHaveBeenCalledTimes(1);
      expect(snackBarSpy).toHaveBeenCalledWith(
        'Some generic failure',
        expect.any(String),
        expect.objectContaining({ panelClass: 'snackbar-error' })
      );
    }));
  });
});
