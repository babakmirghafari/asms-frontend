import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ApplicationsStore } from './applications.store';

const PAGE_RESPONSE = { content: [], totalElements: 0, totalPages: 0, number: 0, size: 20 };

describe('ApplicationsStore', () => {
  let store: InstanceType<typeof ApplicationsStore>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ApplicationsStore, provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(ApplicationsStore);
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
    httpMock.expectOne(req => req.url.includes('/applications')).flush(PAGE_RESPONSE);
  });

  it('should populate items after successful load', async () => {
    const mock = { id: 'app1', name: 'My App', clientId: 'client-1', status: 'ACTIVE' };
    const p = store.load();
    httpMock.expectOne(req => req.url.includes('/applications')).flush({
      content: [mock], totalElements: 1, totalPages: 1, number: 0, size: 20
    });
    await p;
    expect(store.items().length).toBe(1);
    expect(store.loading()).toBe(false);
  });

  it('should set error when load() fails', async () => {
    const p = store.load();
    httpMock.expectOne(req => req.url.includes('/applications')).flush(
      { detail: 'Server error' }, { status: 500, statusText: 'Internal Server Error' }
    );
    await p;
    expect(store.error()).toBeTruthy();
  });

  it('should update page and size', () => {
    store.setPage(1, 50);
    expect(store.page()).toBe(1);
    expect(store.size()).toBe(50);
  });
});
