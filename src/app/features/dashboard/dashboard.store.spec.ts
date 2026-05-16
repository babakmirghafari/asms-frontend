import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { DashboardStore } from './dashboard.store';

describe('DashboardStore', () => {
  let store: InstanceType<typeof DashboardStore>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DashboardStore, provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(DashboardStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should initialise with no summary and not loading', () => {
    expect(store.summary()).toBeNull();
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('should compute hasData false when summary is null', () => {
    expect(store.hasData()).toBe(false);
  });

  it('should compute totalAlerts as 0 when no summary', () => {
    expect(store.totalAlerts()).toBe(0);
    expect(store.criticalAlerts()).toBe(0);
  });

  it('should set loading when load() is called', () => {
    store.load('org1');
    expect(store.loading()).toBe(true);
    httpMock.expectOne(req => req.url.includes('/dashboard')).flush({});
  });

  it('should populate summary after successful load', async () => {
    const mockSummary = {
      totalUsers: 10,
      activeUsers: 8,
      activeSessions: 3,
      recentActivityCount: 42,
      openAlertsBySeverity: { critical: 1, high: 2, medium: 3, low: 4, total: 10 },
      generatedAt: '2025-01-01T00:00:00Z',
    };
    const p = store.load('org1');
    httpMock.expectOne(req => req.url.includes('/dashboard')).flush(mockSummary);
    await p;
    expect(store.summary()).toEqual(mockSummary);
    expect(store.hasData()).toBe(true);
    expect(store.totalAlerts()).toBe(10);
    expect(store.criticalAlerts()).toBe(1);
    expect(store.loading()).toBe(false);
  });

  it('should set error when load() fails', async () => {
    const p = store.load('org1');
    httpMock.expectOne(req => req.url.includes('/dashboard')).flush(
      { detail: 'Not found' }, { status: 404, statusText: 'Not Found' }
    );
    await p;
    expect(store.error()).toBeTruthy();
    expect(store.loading()).toBe(false);
  });
});
