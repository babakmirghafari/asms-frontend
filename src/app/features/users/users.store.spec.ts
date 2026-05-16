import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { UsersStore } from './users.store';

describe('UsersStore', () => {
  let store: InstanceType<typeof UsersStore>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UsersStore, provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(UsersStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should initialise with empty items', () => {
    expect(store.users()).toEqual([]);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('should set loading to true when load() is called', () => {
    store.loadUsers();
    expect(store.loading()).toBe(true);
    httpMock.expectOne(req => req.url.includes('/users')).flush({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 20 });
  });

  it('should populate items after successful load', async () => {
    const mockUser = { id: '1', username: 'alice', email: 'alice@example.com', status: 'ACTIVE' };
    const loadPromise = store.loadUsers();

    httpMock.expectOne(req => req.url.includes('/users')).flush({
      content: [mockUser], totalElements: 1, totalPages: 1, number: 0, size: 20
    });
    await loadPromise;
    expect(store.users().length).toBe(1);
    expect(store.users()[0].username).toBe('alice');
    expect(store.loading()).toBe(false);
  });

  it('should set error state when load() fails', async () => {
    const loadPromise = store.loadUsers();

    httpMock.expectOne(req => req.url.includes('/users')).flush(
      { detail: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' }
    );
    await loadPromise;
    expect(store.error()).toBeTruthy();
    expect(store.loading()).toBe(false);
  });

  it('should update page and size', () => {
    store.setPage(2, 50);
    expect(store.page()).toBe(2);
    expect(store.size()).toBe(50);
  });

  it('should clear error', () => {
    store.clearError();
    expect(store.error()).toBeNull();
  });
});
