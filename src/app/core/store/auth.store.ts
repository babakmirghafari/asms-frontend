import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { Router } from '@angular/router';

export interface AuthState {
  token: string | null;
  userId: string | null;
  organizationId: string | null;
}

const initialState: AuthState = {
  token: localStorage.getItem('asms_token'),
  userId: localStorage.getItem('asms_user_id'),
  organizationId: localStorage.getItem('asms_org_id')
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState<AuthState>(initialState),
  withComputed((store) => ({
    isAuthenticated: computed(() => !!store.token()),
    hasOrganization: computed(() => !!store.organizationId())
  })),
  withMethods((store) => {
    const router = inject(Router);
    return {
      setToken(token: string, userId: string, organizationId?: string): void {
        localStorage.setItem('asms_token', token);
        localStorage.setItem('asms_user_id', userId);
        if (organizationId) {
          localStorage.setItem('asms_org_id', organizationId);
        }
        patchState(store, {
          token,
          userId,
          organizationId: organizationId ?? store.organizationId()
        });
      },

      setOrganization(organizationId: string): void {
        localStorage.setItem('asms_org_id', organizationId);
        patchState(store, { organizationId });
      },

      clearToken(): void {
        localStorage.removeItem('asms_token');
        localStorage.removeItem('asms_user_id');
        localStorage.removeItem('asms_org_id');
        patchState(store, { token: null, userId: null, organizationId: null });
        router.navigate(['/auth']);
      }
      // TODO(angular-logic-implementer): add refresh-token logic and token expiry handling
    };
  })
);
