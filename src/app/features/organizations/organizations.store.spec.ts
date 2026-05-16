import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { OrganizationsStore } from './organizations.store';

describe('OrganizationsStore', () => {
  let store: InstanceType<typeof OrganizationsStore>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OrganizationsStore, provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(OrganizationsStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should initialise with empty orgs and not loading', () => {
    expect(store.orgs()).toEqual([]);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('should compute activeCount as 0 initially', () => {
    expect(store.activeCount()).toBe(0);
  });

  it('should set loading when load() is called', () => {
    store.load();
    expect(store.loading()).toBe(true);
    httpMock.expectOne(req => req.url.includes('/organizations')).flush({
      content: [], totalElements: 0, totalPages: 0, number: 0, size: 20
    });
  });

  it('should populate orgs after successful load', async () => {
    const mockOrg = { id: 'org1', name: 'Acme', status: 'ACTIVE' };
    const p = store.load();
    httpMock.expectOne(req => req.url.includes('/organizations')).flush({
      content: [mockOrg], totalElements: 1, totalPages: 1, number: 0, size: 20
    });
    await p;
    expect(store.orgs().length).toBe(1);
    expect(store.activeCount()).toBe(1);
    expect(store.loading()).toBe(false);
  });

  it('should set error when load() fails', async () => {
    const p = store.load();
    httpMock.expectOne(req => req.url.includes('/organizations')).flush(
      { detail: 'Server error' }, { status: 500, statusText: 'Internal Server Error' }
    );
    await p;
    expect(store.error()).toBeTruthy();
    expect(store.loading()).toBe(false);
  });

  it('should update status filter', () => {
    store.setStatusFilter('ACTIVE');
    expect(store.statusFilter()).toBe('ACTIVE');
  });
});
