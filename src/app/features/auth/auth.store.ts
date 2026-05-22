import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { Router } from '@angular/router';
import { firstValueFrom, Observable } from 'rxjs';
import {
  AuthService,
  LoginResponseDto,
  OrgSummaryForSelectionDto,
  SelectOrgResponseDto,
  MfaVerifyResponseDto
} from '@babakmirghafari/asms-api-client';
import { AuthStore } from '../../core/store/auth.store';

export type AuthStep = 'login' | 'mfa' | 'select-org' | 'change-password';

export interface AuthFeatureState {
  step: AuthStep;
  loading: boolean;
  error: string | null;
  sessionToken: string | null;
  availableOrgs: OrgSummaryForSelectionDto[];
}

export const AuthFeatureStore = signalStore(
  { providedIn: 'root' },
  withState<AuthFeatureState>({
    step: 'login',
    loading: false,
    error: null,
    sessionToken: null,
    availableOrgs: []
  }),
  withComputed((store) => ({
    isLoading: computed(() => store.loading()),
    currentStep: computed(() => store.step()),
    errorMessage: computed(() => store.error())
  })),
  withMethods((store) => {
    const authService = inject(AuthService);
    const authStore = inject(AuthStore);
    const router = inject(Router);

    function handleLoginResponse(response: LoginResponseDto): void {
      switch (response.status) {
        case LoginResponseDto.StatusEnum.Success:
          authStore.setToken(response.accessToken!, 'unknown');
          patchState(store, { loading: false, error: null });
          router.navigate(['/dashboard']);
          break;
        case LoginResponseDto.StatusEnum.MfaRequired:
          patchState(store, { step: 'mfa', sessionToken: response.sessionToken ?? null, loading: false });
          break;
        case LoginResponseDto.StatusEnum.OrgSelectionRequired:
          patchState(store, { step: 'select-org', sessionToken: response.sessionToken ?? null, loading: false });
          break;
        case LoginResponseDto.StatusEnum.TempPasswordRequired:
          patchState(store, { step: 'change-password', sessionToken: response.sessionToken ?? null, loading: false });
          break;
      }
    }

    return {
      async login(username: string, password: string): Promise<void> {
        patchState(store, { loading: true, error: null });
        try {
          const obs: Observable<LoginResponseDto> = authService.login({ username, password });
          const response = await firstValueFrom(obs);
          handleLoginResponse(response);
        } catch {
          patchState(store, { loading: false, error: 'AUTH.INVALID_CREDENTIALS' });
        }
      },

      async verifyMfa(totpCode: string): Promise<void> {
        patchState(store, { loading: true, error: null });
        const sessionToken = store.sessionToken() ?? '';
        try {
          const obs: Observable<MfaVerifyResponseDto> = authService.verifyMfa({ sessionToken, totpCode });
          const response = await firstValueFrom(obs);
          if (response.accessToken) {
            authStore.setToken(response.accessToken, 'unknown');
            patchState(store, { loading: false, error: null });
            router.navigate(['/dashboard']);
          } else if (response.status === MfaVerifyResponseDto.StatusEnum.OrgSelectionRequired) {
            patchState(store, { step: 'select-org', sessionToken: response.sessionToken ?? null, loading: false });
          } else {
            patchState(store, { loading: false, error: 'AUTH.INVALID_CREDENTIALS' });
          }
        } catch {
          patchState(store, { loading: false, error: 'AUTH.INVALID_CREDENTIALS' });
        }
      },

      async selectOrg(organizationId: string): Promise<void> {
        patchState(store, { loading: true, error: null });
        const sessionToken = store.sessionToken() ?? '';
        try {
          const obs: Observable<SelectOrgResponseDto> = authService.selectOrganization({ sessionToken, organizationId });
          const response = await firstValueFrom(obs);
          if (response.accessToken) {
            authStore.setToken(response.accessToken, 'unknown', organizationId);
            patchState(store, { loading: false, error: null });
            router.navigate(['/dashboard']);
          }
        } catch {
          patchState(store, { loading: false, error: 'COMMON.ERROR' });
        }
      },

      async changePassword(newPassword: string): Promise<void> {
        patchState(store, { loading: true, error: null });
        const sessionToken = store.sessionToken() ?? '';
        try {
          const obs: Observable<LoginResponseDto> = authService.changePassword({ sessionToken, newPassword });
          const response = await firstValueFrom(obs);
          handleLoginResponse(response);
        } catch {
          patchState(store, { loading: false, error: 'COMMON.ERROR' });
        }
      },

      resetToLogin(): void {
        patchState(store, { step: 'login', error: null, sessionToken: null });
      }
    };
  })
);
