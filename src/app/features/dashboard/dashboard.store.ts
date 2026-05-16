import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { inject, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { DashboardService, DashboardSummaryDto } from '@babakmirghafari/asms-api-client';

interface DashboardState {
  summary: DashboardSummaryDto | null;
  loading: boolean;
  error: string | null;
  organizationId: string;
}

const initialState: DashboardState = {
  summary: null,
  loading: false,
  error: null,
  organizationId: '',
};

function extractMessage(err: unknown): string {
  if (err && typeof err === 'object') {
    const e = err as Record<string, unknown>;
    const errObj = e['error'] as Record<string, unknown> | undefined;
    if (errObj && typeof errObj['detail'] === 'string') return errObj['detail'];
    if (typeof e['message'] === 'string') return e['message'];
  }
  return 'Failed to load dashboard data.';
}

export const DashboardStore = signalStore(
  withState(initialState),
  withComputed((store) => ({
    totalAlerts: computed(() => store.summary()?.openAlertsBySeverity.total ?? 0),
    criticalAlerts: computed(() => store.summary()?.openAlertsBySeverity.critical ?? 0),
    hasData: computed(() => store.summary() !== null),
  })),
  withMethods((store, svc = inject(DashboardService)) => ({
    async load(organizationId: string): Promise<void> {
      patchState(store, { loading: true, error: null, organizationId });
      try {
        const summary = await firstValueFrom(svc.getDashboardSummary(organizationId));
        patchState(store, { summary, loading: false });
      } catch (err: unknown) {
        patchState(store, { loading: false, error: extractMessage(err) });
      }
    },
  }))
);
