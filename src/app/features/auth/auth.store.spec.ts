import { TestBed } from '@angular/core/testing';
import { AuthFeatureStore } from './auth.store';

describe('AuthFeatureStore', () => {
  let store: InstanceType<typeof AuthFeatureStore>;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [AuthFeatureStore] });
    store = TestBed.inject(AuthFeatureStore);
  });

  it('should initialise with loading false', () => {
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });
});
