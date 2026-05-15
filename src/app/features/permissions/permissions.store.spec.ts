import { TestBed } from '@angular/core/testing';
import { PermissionsStore } from './permissions.store';

describe('PermissionsStore', () => {
  let store: InstanceType<typeof PermissionsStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PermissionsStore],
    });
    store = TestBed.inject(PermissionsStore);
  });

  it('should initialise with empty items', () => {
    expect(store.items()).toEqual([]);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });
});
