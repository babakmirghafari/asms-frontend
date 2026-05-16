import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AuditLogsStore } from './audit-logs.store';

const PAGE_RESPONSE = { content: [], totalElements: 0, totalPages: 0, number: 0, size: 20 };

describe('AuditLogsStore', () => {
  let store: InstanceType<typeof AuditLogsStore>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuditLogsStore, provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(AuditLogsStore);
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
    httpMock.expectOne(req => req.url.includes('/audit')).flush(PAGE_RESPONSE);
  });

  it('should populate items after successful load', async () => {
    const mock = { id: 'al1', eventType: 'USER_CREATED', actorId: 'u1', timestamp: '2025-01-01T00:00:00Z' };
    const p = store.load();
    httpMock.expectOne(req => req.url.includes('/audit')).flush({
      content: [mock], totalElements: 1, totalPages: 1, number: 0, size: 20
    });
    await p;
    expect(store.items().length).toBe(1);
    expect(store.loading()).toBe(false);
  });

  it('should set error when load() fails', async () => {
    const p = store.load();
    httpMock.expectOne(req => req.url.includes('/audit')).flush(
      { detail: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' }
    );
    await p;
    expect(store.error()).toBeTruthy();
    expect(store.loading()).toBe(false);
  });
});
