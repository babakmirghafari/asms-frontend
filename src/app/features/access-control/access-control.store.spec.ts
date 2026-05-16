import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AccessControlStore } from './access-control.store';

describe('AccessControlStore', () => {
  let store: InstanceType<typeof AccessControlStore>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AccessControlStore, provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(AccessControlStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should initialise with null effective permissions and not loading', () => {
    expect(store.effective()).toBeNull();
    expect(store.simulateResult()).toBeNull();
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('should set loading when loadEffective() is called', () => {
    store.loadEffective('u1', 'org1');
    expect(store.loading()).toBe(true);
    httpMock.expectOne(req => req.url.includes('/effective-permissions')).flush({
      userId: 'u1', organizationId: 'org1', permissions: []
    });
  });

  it('should populate effective permissions after successful load', async () => {
    const mockEffective = { userId: 'u1', organizationId: 'org1', permissions: ['READ_USERS'] };
    const p = store.loadEffective('u1', 'org1');
    httpMock.expectOne(req => req.url.includes('/effective-permissions')).flush(mockEffective);
    await p;
    expect(store.effective()).toEqual(mockEffective);
    expect(store.loading()).toBe(false);
  });

  it('should set error when loadEffective() fails', async () => {
    const p = store.loadEffective('u1', 'org1');
    httpMock.expectOne(req => req.url.includes('/effective-permissions')).flush(
      { detail: 'Not found' }, { status: 404, statusText: 'Not Found' }
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
