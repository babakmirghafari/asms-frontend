import { TestBed } from '@angular/core/testing';
import { AuthPoliciesStore } from './auth-policies.store';

describe('AuthPoliciesStore', () => {
  let store: InstanceType<typeof AuthPoliciesStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthPoliciesStore],
    });
    store = TestBed.inject(AuthPoliciesStore);
  });

  it('should initialise with empty items', () => {
    expect(store.items()).toEqual([]);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });
});
