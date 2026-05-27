import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import { DashboardService, DashboardSummaryDto } from '@babakmirghafari/asms-api-client';
import { AuthStore } from '../../core/store/auth.store';
import { extractApiError } from '../../core/utils/api-error.util';

export interface DashboardState {
  summary: DashboardSummaryDto | null;
  loading: boolean;
  error: string | null;
}

export const DashboardStore = signalStore(
  { providedIn: 'root' },
  withState<DashboardState>({
    summary: null,
    loading: false,
    error: null
  }),
  withComputed((store) => ({
    isLoading: computed(() => store.loading()),
    hasSummary: computed(() => !!store.summary()),
    totalUsers: computed(() => store.summary()?.totalUsers ?? 0),
    activeUsers: computed(() => store.summary()?.activeUsers ?? 0),
    lockedUsers: computed(() => store.summary()?.lockedUsers ?? 0),
    activeSessions: computed(() => store.summary()?.activeSessions ?? 0),
    recentActivityCount: computed(() => store.summary()?.recentActivityCount ?? 0),
    alertsBySeverity: computed(() => store.summary()?.openAlertsBySeverity ?? null)
  })),
  withMethods((store) => {
    const dashboardService = inject(DashboardService);
    const authStore = inject(AuthStore);

    return {
      async loadSummary(): Promise<void> {
        const orgId = authStore.organizationId();
        if (!orgId) {
          patchState(store, { loading: false });
          return;
        }
        patchState(store, { loading: true, error: null });
        try {
          const summary = await firstValueFrom(dashboardService.getDashboardSummary(orgId));
          patchState(store, { summary, loading: false });
        } catch (err) {
          patchState(store, { loading: false, error: extractApiError(err) });
        }
      }
    };
  })
);
