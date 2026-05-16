import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { PermissionGroupsStore } from './permission-groups.store';

const PAGE_RESPONSE = { content: [], totalElements: 0, totalPages: 0, number: 0, size: 20 };

describe('PermissionGroupsStore', () => {
  let store: InstanceType<typeof PermissionGroupsStore>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PermissionGroupsStore, provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(PermissionGroupsStore);
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
    httpMock.expectOne(req => req.url.includes('/permission-groups')).flush(PAGE_RESPONSE);
  });

  it('should populate items after successful load', async () => {
    const mock = { id: 'pg1', name: 'Admins', description: 'Admin group' };
    const p = store.load();
    httpMock.expectOne(req => req.url.includes('/permission-groups')).flush({
      content: [mock], totalElements: 1, totalPages: 1, number: 0, size: 20
    });
    await p;
    expect(store.items().length).toBe(1);
    expect(store.loading()).toBe(false);
  });

  it('should set error when load() fails', async () => {
    const p = store.load();
    httpMock.expectOne(req => req.url.includes('/permission-groups')).flush(
      { detail: 'Not found' }, { status: 404, statusText: 'Not Found' }
    );
    await p;
    expect(store.error()).toBeTruthy();
  });

  it('should update page and size', () => {
    store.setPage(2, 50);
    expect(store.page()).toBe(2);
    expect(store.size()).toBe(50);
  });
});
