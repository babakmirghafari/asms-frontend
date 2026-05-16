import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthService, LoginRequestDto } from '@babakmirghafari/asms-api-client';

interface AuthState {
  token: string | null;
  userId: string | null;
  sessionToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  step: 'login' | 'mfa' | 'org-select' | 'temp-password' | 'authenticated';
}

const initialState: AuthState = {
  token: localStorage.getItem('auth_token'),
  userId: localStorage.getItem('auth_user_id'),
  sessionToken: null,
  isAuthenticated: !!localStorage.getItem('auth_token'),
  loading: false,
  error: null,
  step: localStorage.getItem('auth_token') ? 'authenticated' : 'login',
};

function extractErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object') {
    const e = err as Record<string, unknown>;
    if (typeof e['message'] === 'string') return e['message'];
    const errObj = e['error'] as Record<string, unknown> | undefined;
    if (errObj && typeof errObj['detail'] === 'string') return errObj['detail'];
  }
  return fallback;
}

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    isAuthenticated: computed(() => !!store.token()),
  })),
  withMethods((store, authService = inject(AuthService)) => ({
    async login(credentials: LoginRequestDto): Promise<void> {
      patchState(store, { loading: true, error: null });
      try {
        const res = await firstValueFrom(authService.login(credentials));
        switch (res.status) {
          case 'SUCCESS':
            localStorage.setItem('auth_token', res.accessToken!);
            patchState(store, { token: res.accessToken!, isAuthenticated: true, step: 'authenticated', loading: false });
            break;
          case 'MFA_REQUIRED':
            patchState(store, { sessionToken: res.sessionToken!, step: 'mfa', loading: false });
            break;
          case 'ORG_SELECTION_REQUIRED':
            patchState(store, { sessionToken: res.sessionToken!, step: 'org-select', loading: false });
            break;
          case 'TEMP_PASSWORD_REQUIRED':
            patchState(store, { sessionToken: res.sessionToken!, step: 'temp-password', loading: false });
            break;
        }
      } catch (err: unknown) {
        patchState(store, { loading: false, error: extractErrorMessage(err, 'Login failed. Check your credentials.') });
      }
    },

    async logout(): Promise<void> {
      try { await firstValueFrom(authService.logout()); } catch { /* ignore */ }
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user_id');
      patchState(store, { token: null, userId: null, isAuthenticated: false, step: 'login', sessionToken: null });
    },

    setToken(token: string, userId: string): void {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user_id', userId);
      patchState(store, { token, userId, isAuthenticated: true, step: 'authenticated' });
    },

    clearToken(): void {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user_id');
      patchState(store, { token: null, userId: null, isAuthenticated: false, step: 'login' });
    },

    clearError(): void {
      patchState(store, { error: null });
    },
  }))
);
