import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import {
  AuthPoliciesService, AuthPolicyDto, UpdateAuthPolicyRequestDto, PagedResponseDto
} from '@babakmirghafari/asms-api-client';
import { AuthStore } from '../../core/store/auth.store';

export interface AuthPoliciesState {
  items: AuthPolicyDto[];
  current: AuthPolicyDto | null;
  totalElements: number;
  pageIndex: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
}

export const AuthPoliciesStore = signalStore(
  { providedIn: 'root' },
  withState<AuthPoliciesState>({
    items: [],
    current: null,
    totalElements: 0,
    pageIndex: 0,
    pageSize: 20,
    loading: false,
    error: null
  }),
  withComputed((store) => ({
    isLoading: computed(() => store.loading()),
    isEmpty: computed(() => store.items().length === 0 && !store.loading())
  })),
  withMethods((store) => {
    const svc = inject(AuthPoliciesService);
    const authStore = inject(AuthStore);
    return {
      async loadAll(page = 0, size = 20): Promise<void> {
        patchState(store, { loading: true, error: null, pageIndex: page, pageSize: size });
        try {
          const res: PagedResponseDto = await firstValueFrom(svc.listAuthPolicies(page, size));
          patchState(store, { items: res.content as AuthPolicyDto[], totalElements: res.totalElements, loading: false });
        } catch {
          patchState(store, { loading: false, error: 'COMMON.ERROR' });
        }
      },
      async loadCurrent(): Promise<void> {
        const orgId = authStore.organizationId();
        if (!orgId) return;
        patchState(store, { loading: true, error: null });
        try {
          const policy = await firstValueFrom(svc.getAuthPolicyByOrganization(orgId));
          patchState(store, { current: policy, loading: false });
        } catch {
          patchState(store, { loading: false, error: 'COMMON.ERROR' });
        }
      },
      async update(organizationId: string, dto: UpdateAuthPolicyRequestDto): Promise<void> {
        patchState(store, { loading: true, error: null });
        try {
          const updated = await firstValueFrom(svc.updateAuthPolicy(organizationId, dto));
          patchState(store, {
            current: updated,
            items: store.items().map(p => p.id === updated.id ? updated : p),
            loading: false
          });
        } catch {
          patchState(store, { loading: false, error: 'COMMON.ERROR' });
        }
      }
    };
  })
);
