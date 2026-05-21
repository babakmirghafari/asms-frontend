import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthStore } from './auth.store';

describe('AuthStore', () => {
  let store: InstanceType<typeof AuthStore>;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        AuthStore
      ]
    });
    store = TestBed.inject(AuthStore);
  });

  it('should initialise with null token when localStorage is empty', () => {
    expect(store.token()).toBeNull();
    expect(store.isAuthenticated()).toBe(false);
  });

  it('should set token and update isAuthenticated', () => {
    store.setToken('test-jwt', 'user-1');
    expect(store.token()).toBe('test-jwt');
    expect(store.userId()).toBe('user-1');
    expect(store.isAuthenticated()).toBe(true);
  });

  it('should clear token on clearToken', () => {
    store.setToken('test-jwt', 'user-1');
    store.clearToken();
    expect(store.token()).toBeNull();
    expect(store.isAuthenticated()).toBe(false);
  });
});
