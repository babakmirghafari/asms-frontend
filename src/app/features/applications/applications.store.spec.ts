import { TestBed } from '@angular/core/testing';
import { ApplicationsStore } from './applications.store';

describe('ApplicationsStore', () => {
  let store: InstanceType<typeof ApplicationsStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ApplicationsStore],
    });
    store = TestBed.inject(ApplicationsStore);
  });

  it('should initialise with empty items', () => {
    expect(store.items()).toEqual([]);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });
});
