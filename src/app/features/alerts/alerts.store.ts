import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { inject, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AlertsService, AlertDto, AcknowledgeAlertRequestDto, ResolveAlertRequestDto, EscalateAlertRequestDto, PagedResponseDto } from '@babakmirghafari/asms-api-client';

interface AlertsState { items: AlertDto[]; totalElements: number; page: number; size: number; severityFilter: string; statusFilter: string; loading: boolean; saving: boolean; error: string | null; }
const init: AlertsState = { items: [], totalElements: 0, page: 0, size: 20, severityFilter: '', statusFilter: '', loading: false, saving: false, error: null };
function msg(e: unknown, fb = 'Operation failed.'): string { if (e && typeof e === 'object') { const x = e as Record<string, unknown>; const o = x['error'] as Record<string, unknown> | undefined; if (o && typeof o['detail'] === 'string') return o['detail']; if (typeof x['message'] === 'string') return x['message']; } return fb; }

type AlertSev = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
type AlertStatus = 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED' | 'SUPPRESSED';

export const AlertsStore = signalStore(
  withState(init),
  withComputed((s) => ({
    criticalCount: computed(() => s.items().filter(a => a.severity === 'CRITICAL').length),
    openCount:     computed(() => s.items().filter(a => a.status === 'OPEN').length),
  })),
  withMethods((store, svc = inject(AlertsService)) => ({
    async load(): Promise<void> {
      patchState(store, { loading: true, error: null });
      try {
        const sev    = store.severityFilter() as AlertSev || undefined;
        const status = store.statusFilter() as AlertStatus || undefined;
        const res: PagedResponseDto = await firstValueFrom(svc.listAlerts(store.page(), store.size(), undefined, sev, status));
        patchState(store, { items: res.content as AlertDto[], totalElements: res.totalElements, loading: false });
      } catch (e) { patchState(store, { loading: false, error: msg(e, 'Failed to load alerts.') }); }
    },
    setPage(page: number, size: number) { patchState(store, { page, size }); },
    setSeverityFilter(v: string) { patchState(store, { severityFilter: v, page: 0 }); },
    setStatusFilter(v: string)   { patchState(store, { statusFilter: v, page: 0 }); },
    async acknowledge(id: string, dto: AcknowledgeAlertRequestDto): Promise<boolean> {
      patchState(store, { saving: true, error: null });
      try { const r = await firstValueFrom(svc.acknowledgeAlert(id, dto)); patchState(store, { saving: false, items: store.items().map(a => a.id === id ? r : a) }); return true; }
      catch (e) { patchState(store, { saving: false, error: msg(e) }); return false; }
    },
    async resolve(id: string, dto: ResolveAlertRequestDto): Promise<boolean> {
      patchState(store, { saving: true, error: null });
      try { const r = await firstValueFrom(svc.resolveAlert(id, dto)); patchState(store, { saving: false, items: store.items().map(a => a.id === id ? r : a) }); return true; }
      catch (e) { patchState(store, { saving: false, error: msg(e) }); return false; }
    },
    async escalate(id: string, dto: EscalateAlertRequestDto): Promise<boolean> {
      patchState(store, { saving: true, error: null });
      try { const r = await firstValueFrom(svc.escalateAlert(id, dto)); patchState(store, { saving: false, items: store.items().map(a => a.id === id ? r : a) }); return true; }
      catch (e) { patchState(store, { saving: false, error: msg(e) }); return false; }
    },
    clearError() { patchState(store, { error: null }); },
  }))
);
