import { TestBed } from '@angular/core/testing';
import { StationPoliciesStore } from './station-policies.store';

describe('StationPoliciesStore', () => {
  let store: InstanceType<typeof StationPoliciesStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [StationPoliciesStore],
    });
    store = TestBed.inject(StationPoliciesStore);
  });

  it('should initialise with empty items', () => {
    expect(store.items()).toEqual([]);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });
});
