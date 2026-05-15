import { TestBed } from '@angular/core/testing';
import { AccessControlStore } from './access-control.store';

describe('AccessControlStore', () => {
  let store: InstanceType<typeof AccessControlStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AccessControlStore],
    });
    store = TestBed.inject(AccessControlStore);
  });

  it('should initialise with empty items', () => {
    expect(store.items()).toEqual([]);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });
});
