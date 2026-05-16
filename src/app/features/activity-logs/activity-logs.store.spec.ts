import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ActivityLogsStore } from './activity-logs.store';

const PAGE_RESPONSE = { content: [], totalElements: 0, totalPages: 0, number: 0, size: 20 };

describe('ActivityLogsStore', () => {
  let store: InstanceType<typeof ActivityLogsStore>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ActivityLogsStore, provideHttpClient(), provideHttpClientTesting()],
    });
    store = TestBed.inject(ActivityLogsStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should initialise with empty items and not loading', () => {
    expect(store.items()).toEqual([]);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('should set loading when load() is called', () => {
    store.load('org1');
    expect(store.loading()).toBe(true);
    httpMock.expectOne(req => req.url.includes('/activity-logs')).flush(PAGE_RESPONSE);
  });

  it('should populate items after successful load', async () => {
    const mock = { id: 'log1', action: 'LOGIN', userId: 'u1', timestamp: '2025-01-01T00:00:00Z' };
    const p = store.load('org1');
    httpMock.expectOne(req => req.url.includes('/activity-logs')).flush({
      content: [mock], totalElements: 1, totalPages: 1, number: 0, size: 20
    });
    await p;
    expect(store.items().length).toBe(1);
    expect(store.loading()).toBe(false);
  });

  it('should set error when load() fails', async () => {
    const p = store.load('org1');
    httpMock.expectOne(req => req.url.includes('/activity-logs')).flush(
      { detail: 'Server error' }, { status: 500, statusText: 'Internal Server Error' }
    );
    await p;
    expect(store.error()).toBeTruthy();
  });

  it('should update category filter', () => {
    store.setCategory('AUTH');
    expect(store.category()).toBe('AUTH');
  });
});
