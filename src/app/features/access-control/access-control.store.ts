import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AccessControlService, EffectivePermissionsDto, AccessControlSimulateRequestDto, AccessControlSimulateResponseDto } from '@babakmirghafari/asms-api-client';

interface ACState { effective: EffectivePermissionsDto | null; simulateResult: AccessControlSimulateResponseDto | null; loading: boolean; simulating: boolean; error: string | null; }
const init: ACState = { effective: null, simulateResult: null, loading: false, simulating: false, error: null };
function msg(e: unknown, fb = 'Operation failed.'): string { if (e && typeof e === 'object') { const x = e as Record<string, unknown>; const o = x['error'] as Record<string, unknown> | undefined; if (o && typeof o['detail'] === 'string') return o['detail']; if (typeof x['message'] === 'string') return x['message']; } return fb; }

export const AccessControlStore = signalStore(
  withState(init),
  withMethods((store, svc = inject(AccessControlService)) => ({
    async loadEffective(userId: string, orgId: string): Promise<void> {
      patchState(store, { loading: true, error: null });
      try { const r = await firstValueFrom(svc.getEffectivePermissions(userId, orgId)); patchState(store, { effective: r, loading: false }); }
      catch (e) { patchState(store, { loading: false, error: msg(e, 'Failed to load effective permissions.') }); }
    },
    async simulate(dto: AccessControlSimulateRequestDto): Promise<void> {
      patchState(store, { simulating: true, error: null });
      try { const r = await firstValueFrom(svc.simulateAccessControl(dto)); patchState(store, { simulateResult: r, simulating: false }); }
      catch (e) { patchState(store, { simulating: false, error: msg(e) }); }
    },
    clearError() { patchState(store, { error: null }); },
  }))
);
