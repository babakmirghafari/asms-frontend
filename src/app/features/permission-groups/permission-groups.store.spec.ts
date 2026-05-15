import { TestBed } from '@angular/core/testing';
import { PermissionGroupsStore } from './permission-groups.store';

describe('PermissionGroupsStore', () => {
  let store: InstanceType<typeof PermissionGroupsStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PermissionGroupsStore],
    });
    store = TestBed.inject(PermissionGroupsStore);
  });

  it('should initialise with empty items', () => {
    expect(store.items()).toEqual([]);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });
});
