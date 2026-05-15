import { TestBed } from '@angular/core/testing';
import { DashboardStore } from './dashboard.store';

describe('DashboardStore', () => {
  let store: InstanceType<typeof DashboardStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DashboardStore],
    });
    store = TestBed.inject(DashboardStore);
  });

  it('should initialise with empty items', () => {
    expect(store.items()).toEqual([]);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });
});
