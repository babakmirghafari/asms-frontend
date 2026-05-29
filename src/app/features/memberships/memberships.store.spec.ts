import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { MembershipsService } from '@babakmirghafari/asms-api-client';
import { MembershipsStore, LastActiveMembershipError } from './memberships.store';
import { MembershipDto } from '@babakmirghafari/asms-api-client';

const makeMembership = (id: string): MembershipDto => ({
  id,
  userId: `user-${id}`,
  organizationId: 'org-1',
  status: MembershipDto.StatusEnum.Active,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z'
});

describe('MembershipsStore', () => {
  let store: InstanceType<typeof MembershipsStore>;
  let svc: jest.Mocked<MembershipsService>;

  beforeEach(() => {
    const mockSvc: Partial<jest.Mocked<MembershipsService>> = {
      listMemberships: jest.fn(),
      createMembership: jest.fn(),
      deleteMembership: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        MembershipsStore,
        { provide: MembershipsService, useValue: mockSvc }
      ]
    });

    store = TestBed.inject(MembershipsStore);
    svc = TestBed.inject(MembershipsService) as jest.Mocked<MembershipsService>;
  });

  it('should initialise with empty items', () => {
    expect(store.items()).toEqual([]);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  // -------------------------------------------------------------------------
  // delete — success path
  // -------------------------------------------------------------------------
  describe('delete(id) — success', () => {
    it('removes the item from items() and decrements totalElements', async () => {
      const m1 = makeMembership('m-1');
      const m2 = makeMembership('m-2');

      // Seed the store with two items by patching via a loadAll mock
      svc.listMemberships.mockReturnValue(
        of({ content: [m1, m2], totalElements: 2, page: 0, size: 20, totalPages: 1 } as any)
      );
      await TestBed.runInInjectionContext(() => store.loadAll());

      expect(store.items()).toHaveLength(2);
      expect(store.totalElements()).toBe(2);

      svc.deleteMembership.mockReturnValue(of(undefined as any));

      await TestBed.runInInjectionContext(() => store.delete('m-1'));

      expect(store.items()).toHaveLength(1);
      expect(store.items()[0].id).toBe('m-2');
      expect(store.totalElements()).toBe(1);
      expect(store.loading()).toBe(false);
      expect(store.error()).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // delete — 409 guard violation (status 409)
  // -------------------------------------------------------------------------
  describe('delete(id) — 409 guard violation', () => {
    it('throws LastActiveMembershipError and leaves items unchanged', async () => {
      const m1 = makeMembership('m-1');

      svc.listMemberships.mockReturnValue(
        of({ content: [m1], totalElements: 1, page: 0, size: 20, totalPages: 1 } as any)
      );
      await TestBed.runInInjectionContext(() => store.loadAll());

      const err = new HttpErrorResponse({ status: 409, error: { code: 'LAST_ACTIVE_MEMBERSHIP' } });
      svc.deleteMembership.mockReturnValue(throwError(() => err));

      await expect(
        TestBed.runInInjectionContext(() => store.delete('m-1'))
      ).rejects.toBeInstanceOf(LastActiveMembershipError);

      expect(store.items()).toHaveLength(1);
      expect(store.items()[0].id).toBe('m-1');
      expect(store.loading()).toBe(false);
    });

    it('throws LastActiveMembershipError when only status is 409 (no error.code)', async () => {
      const m1 = makeMembership('m-1');

      svc.listMemberships.mockReturnValue(
        of({ content: [m1], totalElements: 1, page: 0, size: 20, totalPages: 1 } as any)
      );
      await TestBed.runInInjectionContext(() => store.loadAll());

      const err = new HttpErrorResponse({ status: 409, error: {} });
      svc.deleteMembership.mockReturnValue(throwError(() => err));

      await expect(
        TestBed.runInInjectionContext(() => store.delete('m-1'))
      ).rejects.toBeInstanceOf(LastActiveMembershipError);

      expect(store.loading()).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // delete — generic error (500)
  // -------------------------------------------------------------------------
  describe('delete(id) — generic error', () => {
    it('throws a regular Error, sets error(), and leaves items unchanged', async () => {
      const m1 = makeMembership('m-1');

      svc.listMemberships.mockReturnValue(
        of({ content: [m1], totalElements: 1, page: 0, size: 20, totalPages: 1 } as any)
      );
      await TestBed.runInInjectionContext(() => store.loadAll());

      const err = new HttpErrorResponse({ status: 500, error: { message: 'Internal Server Error' } });
      svc.deleteMembership.mockReturnValue(throwError(() => err));

      let thrown: unknown;
      try {
        await TestBed.runInInjectionContext(() => store.delete('m-1'));
      } catch (e) {
        thrown = e;
      }

      expect(thrown).toBeInstanceOf(Error);
      expect(thrown).not.toBeInstanceOf(LastActiveMembershipError);
      expect(store.loading()).toBe(false);
      expect(store.error()).toBe('Internal Server Error');
      // items are unchanged
      expect(store.items()).toHaveLength(1);
    });

    it('throws a regular Error with fallback message when error body has no message', async () => {
      const m1 = makeMembership('m-1');

      svc.listMemberships.mockReturnValue(
        of({ content: [m1], totalElements: 1, page: 0, size: 20, totalPages: 1 } as any)
      );
      await TestBed.runInInjectionContext(() => store.loadAll());

      const err = new HttpErrorResponse({ status: 500, error: null });
      svc.deleteMembership.mockReturnValue(throwError(() => err));

      let thrown: unknown;
      try {
        await TestBed.runInInjectionContext(() => store.delete('m-1'));
      } catch (e) {
        thrown = e;
      }

      expect(thrown).toBeInstanceOf(Error);
      expect(thrown).not.toBeInstanceOf(LastActiveMembershipError);
      expect(store.loading()).toBe(false);
      expect(store.error()).toBeTruthy();
    });
  });
});
