import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AlertsStore } from './alerts.store';

describe('AlertsStore', () => {
  let store: InstanceType<typeof AlertsStore>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AlertsStore, provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(AlertsStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should initialise with empty items and not loading', () => {
    expect(store.items()).toEqual([]);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('should compute criticalCount and openCount as 0 initially', () => {
    expect(store.criticalCount()).toBe(0);
    expect(store.openCount()).toBe(0);
  });

  it('should set loading when load() is called', () => {
    store.load();
    expect(store.loading()).toBe(true);
    httpMock.expectOne(req => req.url.includes('/alerts')).flush({
      content: [], totalElements: 0, totalPages: 0, number: 0, size: 20
    });
  });

  it('should populate items after successful load', async () => {
    const mockAlert = { id: 'a1', severity: 'CRITICAL', status: 'OPEN', message: 'Test' };
    const p = store.load();
    httpMock.expectOne(req => req.url.includes('/alerts')).flush({
      content: [mockAlert], totalElements: 1, totalPages: 1, number: 0, size: 20
    });
    await p;
    expect(store.items().length).toBe(1);
    expect(store.criticalCount()).toBe(1);
    expect(store.openCount()).toBe(1);
    expect(store.loading()).toBe(false);
  });

  it('should set error when load() fails', async () => {
    const p = store.load();
    httpMock.expectOne(req => req.url.includes('/alerts')).flush(
      { detail: 'Forbidden' }, { status: 403, statusText: 'Forbidden' }
    );
    await p;
    expect(store.error()).toBeTruthy();
    expect(store.loading()).toBe(false);
  });

  it('should update severity and status filters and reset page', () => {
    store.setSeverityFilter('CRITICAL');
    expect(store.severityFilter()).toBe('CRITICAL');
    expect(store.page()).toBe(0);
    store.setStatusFilter('OPEN');
    expect(store.statusFilter()).toBe('OPEN');
  });

  it('should update page and size', () => {
    store.setPage(1, 50);
    expect(store.page()).toBe(1);
    expect(store.size()).toBe(50);
  });
});
