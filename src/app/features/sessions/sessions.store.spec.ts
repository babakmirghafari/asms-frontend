import { TestBed } from '@angular/core/testing';
import { SessionsStore } from './sessions.store';

describe('SessionsStore', () => {
  let store: InstanceType<typeof SessionsStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SessionsStore],
    });
    store = TestBed.inject(SessionsStore);
  });

  it('should initialise with empty items', () => {
    expect(store.items()).toEqual([]);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });
});
