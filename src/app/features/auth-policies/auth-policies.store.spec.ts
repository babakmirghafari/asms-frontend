import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AuthPoliciesStore } from './auth-policies.store';

describe('AuthPoliciesStore', () => {
  let store: InstanceType<typeof AuthPoliciesStore>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthPoliciesStore, provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(AuthPoliciesStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should initialise with empty items, no selection, and not loading', () => {
    expect(store.items()).toEqual([]);
    expect(store.selected()).toBeNull();
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('should set loading when load() is called', () => {
    store.load();
    expect(store.loading()).toBe(true);
    httpMock.expectOne(req => req.url.includes('/auth-policies')).flush({
      content: [], totalElements: 0, totalPages: 0, number: 0, size: 20
    });
  });

  it('should populate items after successful load', async () => {
    const mockPolicy = { id: 'p1', organizationId: 'org1', mfaRequired: true, passwordMinLength: 8 };
    const p = store.load();
    httpMock.expectOne(req => req.url.includes('/auth-policies')).flush({
      content: [mockPolicy], totalElements: 1, totalPages: 1, number: 0, size: 20
    });
    await p;
    expect(store.items().length).toBe(1);
    expect(store.loading()).toBe(false);
  });

  it('should set error when load() fails', async () => {
    const p = store.load();
    httpMock.expectOne(req => req.url.includes('/auth-policies')).flush(
      { detail: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' }
    );
    await p;
    expect(store.error()).toBeTruthy();
    expect(store.loading()).toBe(false);
  });

  it('should clear error', () => {
    store.clearError();
    expect(store.error()).toBeNull();
  });
});
