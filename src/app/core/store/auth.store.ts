import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';

interface AuthState {
  token: string | null;
  userId: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  token: localStorage.getItem('auth_token'),
  userId: null,
  isAuthenticated: !!localStorage.getItem('auth_token'),
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    setToken(token: string, userId: string): void {
      localStorage.setItem('auth_token', token);
      patchState(store, { token, userId, isAuthenticated: true });
    },
    clearToken(): void {
      localStorage.removeItem('auth_token');
      patchState(store, { token: null, userId: null, isAuthenticated: false });
    },
    // TODO(angular-logic-implementer): add refresh token logic, org context storage
  }))
);
