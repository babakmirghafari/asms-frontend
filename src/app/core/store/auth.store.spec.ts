import { TestBed } from '@angular/core/testing';
import { AuthStore } from './auth.store';

describe('AuthStore', () => {
  let store: InstanceType<typeof AuthStore>;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    store = TestBed.inject(AuthStore);
  });

  it('should start unauthenticated when no token in localStorage', () => {
    expect(store.isAuthenticated()).toBe(false);
    expect(store.token()).toBeNull();
  });

  it('should set token and mark authenticated', () => {
    store.setToken('my-jwt', 'user-123');
    expect(store.isAuthenticated()).toBe(true);
    expect(store.token()).toBe('my-jwt');
    expect(localStorage.getItem('auth_token')).toBe('my-jwt');
  });

  it('should clear token on logout', () => {
    store.setToken('my-jwt', 'user-123');
    store.clearToken();
    expect(store.isAuthenticated()).toBe(false);
    expect(store.token()).toBeNull();
    expect(localStorage.getItem('auth_token')).toBeNull();
  });
});
