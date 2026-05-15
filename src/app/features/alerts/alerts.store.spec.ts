import { TestBed } from '@angular/core/testing';
import { AlertsStore } from './alerts.store';

describe('AlertsStore', () => {
  let store: InstanceType<typeof AlertsStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AlertsStore],
    });
    store = TestBed.inject(AlertsStore);
  });

  it('should initialise with empty items', () => {
    expect(store.items()).toEqual([]);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });
});
