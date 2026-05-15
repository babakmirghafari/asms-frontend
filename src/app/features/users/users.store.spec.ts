import { TestBed } from '@angular/core/testing';
import { UsersStore } from './users.store';

describe('UsersStore', () => {
  let store: InstanceType<typeof UsersStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UsersStore],
    });
    store = TestBed.inject(UsersStore);
  });

  it('should initialise with empty items', () => {
    expect(store.items()).toEqual([]);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });
});
