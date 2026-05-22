import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import {
  AccessControlService,
  EffectivePermissionsDto,
  AccessControlSimulateRequestDto,
  AccessControlSimulateResponseDto
} from '@babakmirghafari/asms-api-client';

export interface AccessControlState {
  effectivePermissions: EffectivePermissionsDto | null;
  simulationResult: AccessControlSimulateResponseDto | null;
  loading: boolean;
  error: string | null;
}

export const AccessControlStore = signalStore(
  { providedIn: 'root' },
  withState<AccessControlState>({
    effectivePermissions: null,
    simulationResult: null,
    loading: false,
    error: null
  }),
  withComputed((store) => ({
    isLoading: computed(() => store.loading()),
    hasResult: computed(() => !!store.simulationResult())
  })),
  withMethods((store) => {
    const svc = inject(AccessControlService);
    return {
      async loadEffectivePermissions(userId: string, organizationId: string): Promise<void> {
        patchState(store, { loading: true, error: null });
        try {
          const result = await firstValueFrom(svc.getEffectivePermissions(userId, organizationId));
          patchState(store, { effectivePermissions: result, loading: false });
        } catch {
          patchState(store, { loading: false, error: 'COMMON.ERROR' });
        }
      },
      async simulate(dto: AccessControlSimulateRequestDto): Promise<void> {
        // dto.action type is already correct from the contract
        patchState(store, { loading: true, error: null });
        try {
          const result = await firstValueFrom(svc.simulateAccessControl(dto));
          patchState(store, { simulationResult: result, loading: false });
        } catch {
          patchState(store, { loading: false, error: 'COMMON.ERROR' });
        }
      },
      clearResult(): void {
        patchState(store, { simulationResult: null });
      }
    };
  })
);
