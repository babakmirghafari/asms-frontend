import { TestBed } from '@angular/core/testing';
import { MembershipsStore } from './memberships.store';

describe('MembershipsStore', () => {
  let store: InstanceType<typeof MembershipsStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MembershipsStore],
    });
    store = TestBed.inject(MembershipsStore);
  });

  it('should initialise with empty items', () => {
    expect(store.items()).toEqual([]);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });
});
