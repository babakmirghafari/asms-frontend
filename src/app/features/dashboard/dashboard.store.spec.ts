import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { DashboardStore } from './dashboard.store';

describe('DashboardStore', () => {
  let store: InstanceType<typeof DashboardStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DashboardStore, provideHttpClient(), provideRouter([])]
    });
    store = TestBed.inject(DashboardStore);
  });

  it('should initialise with no summary', () => {
    expect(store.summary()).toBeNull();
    expect(store.loading()).toBe(false);
    expect(store.totalUsers()).toBe(0);
    expect(store.activeUsers()).toBe(0);
  });

  it('hasSummary should be false initially', () => {
    expect(store.hasSummary()).toBe(false);
  });
});
