import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthPoliciesService, AuthPolicyDto, UpdateAuthPolicyRequestDto } from '@babakmirghafari/asms-api-client';

interface AuthPoliciesState { items: AuthPolicyDto[]; selected: AuthPolicyDto | null; loading: boolean; saving: boolean; error: string | null; }
const init: AuthPoliciesState = { items: [], selected: null, loading: false, saving: false, error: null };
function msg(e: unknown, fb = 'Operation failed.'): string { if (e && typeof e === 'object') { const x = e as Record<string, unknown>; const o = x['error'] as Record<string, unknown> | undefined; if (o && typeof o['detail'] === 'string') return o['detail']; if (typeof x['message'] === 'string') return x['message']; } return fb; }

export const AuthPoliciesStore = signalStore(
  withState(init),
  withMethods((store, svc = inject(AuthPoliciesService)) => ({
    async load(): Promise<void> {
      patchState(store, { loading: true, error: null });
      try { const res = await firstValueFrom(svc.listAuthPolicies()); patchState(store, { items: res.content as AuthPolicyDto[], loading: false }); }
      catch (e) { patchState(store, { loading: false, error: msg(e, 'Failed to load auth policies.') }); }
    },
    async loadByOrg(orgId: string): Promise<void> {
      patchState(store, { loading: true, error: null });
      try { const r = await firstValueFrom(svc.getAuthPolicyByOrganization(orgId)); patchState(store, { selected: r, loading: false }); }
      catch (e) { patchState(store, { loading: false, error: msg(e) }); }
    },
    async update(id: string, dto: UpdateAuthPolicyRequestDto): Promise<AuthPolicyDto | null> {
      patchState(store, { saving: true, error: null });
      try { const r = await firstValueFrom(svc.updateAuthPolicy(id, dto)); patchState(store, { saving: false, selected: r }); return r; }
      catch (e) { patchState(store, { saving: false, error: msg(e) }); return null; }
    },
    clearError() { patchState(store, { error: null }); },
  }))
);
