import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import {
  AlertsService, AlertDto, PagedResponseDto
} from '@babakmirghafari/asms-api-client';

export interface AlertsState {
  items: AlertDto[];
  totalElements: number;
  pageIndex: number;
  pageSize: number;
  filterSeverity: string;
  filterStatus: string;
  loading: boolean;
  error: string | null;
}

export const AlertsStore = signalStore(
  { providedIn: 'root' },
  withState<AlertsState>({
    items: [],
    totalElements: 0,
    pageIndex: 0,
    pageSize: 20,
    filterSeverity: '',
    filterStatus: '',
    loading: false,
    error: null
  }),
  withComputed((store) => ({
    isLoading: computed(() => store.loading()),
    isEmpty: computed(() => store.items().length === 0 && !store.loading())
  })),
  withMethods((store) => {
    const svc = inject(AlertsService);
    return {
      async loadAll(
        page = 0,
        size = 20,
        severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
        status?: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED' | 'SUPPRESSED'
      ): Promise<void> {
        patchState(store, { loading: true, error: null, pageIndex: page, pageSize: size });
        try {
          const res: PagedResponseDto = await firstValueFrom(svc.listAlerts(page, size, undefined, severity, status));
          patchState(store, { items: res.content as AlertDto[], totalElements: res.totalElements, loading: false });
        } catch {
          patchState(store, { loading: false, error: 'COMMON.ERROR' });
        }
      },
      async acknowledge(alertId: string, note = 'Acknowledged by admin'): Promise<void> {
        patchState(store, { loading: true, error: null });
        try {
          const updated: AlertDto = await firstValueFrom(svc.acknowledgeAlert(alertId, { note }));
          patchState(store, { items: store.items().map(a => a.id === alertId ? updated : a), loading: false });
        } catch {
          patchState(store, { loading: false, error: 'COMMON.ERROR' });
        }
      },
      async resolve(alertId: string, note = 'Resolved by admin'): Promise<void> {
        patchState(store, { loading: true, error: null });
        try {
          const updated: AlertDto = await firstValueFrom(svc.resolveAlert(alertId, { note }));
          patchState(store, { items: store.items().map(a => a.id === alertId ? updated : a), loading: false });
        } catch {
          patchState(store, { loading: false, error: 'COMMON.ERROR' });
        }
      }
    };
  })
);
