import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { MembershipsStore } from './memberships.store';

const PAGE_RESPONSE = { content: [], totalElements: 0, totalPages: 0, number: 0, size: 20 };

describe('MembershipsStore', () => {
  let store: InstanceType<typeof MembershipsStore>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MembershipsStore, provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(MembershipsStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should initialise with empty items and not loading', () => {
    expect(store.items()).toEqual([]);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('should set loading when load() is called', () => {
    store.load();
    expect(store.loading()).toBe(true);
    httpMock.expectOne(req => req.url.includes('/memberships')).flush(PAGE_RESPONSE);
  });

  it('should populate items after successful load', async () => {
    const mock = { id: 'm1', userId: 'u1', organizationId: 'org1', role: 'ADMIN' };
    const p = store.load();
    httpMock.expectOne(req => req.url.includes('/memberships')).flush({
      content: [mock], totalElements: 1, totalPages: 1, number: 0, size: 20
    });
    await p;
    expect(store.items().length).toBe(1);
    expect(store.loading()).toBe(false);
  });

  it('should set error when load() fails', async () => {
    const p = store.load();
    httpMock.expectOne(req => req.url.includes('/memberships')).flush(
      { detail: 'Forbidden' }, { status: 403, statusText: 'Forbidden' }
    );
    await p;
    expect(store.error()).toBeTruthy();
    expect(store.loading()).toBe(false);
  });
});
