import { TestBed } from '@angular/core/testing';
import { ActivityLogsStore } from './activity-logs.store';

describe('ActivityLogsStore', () => {
  let store: InstanceType<typeof ActivityLogsStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ActivityLogsStore],
    });
    store = TestBed.inject(ActivityLogsStore);
  });

  it('should initialise with empty items', () => {
    expect(store.items()).toEqual([]);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });
});
