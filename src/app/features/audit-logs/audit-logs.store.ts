import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuditLogsService, AuditLogEntryDto, AuditExportRequestDto } from '@babakmirghafari/asms-api-client';

interface AuditLogsState { items: AuditLogEntryDto[]; totalElements: number; page: number; size: number; loading: boolean; exporting: boolean; error: string | null; }
const init: AuditLogsState = { items: [], totalElements: 0, page: 0, size: 20, loading: false, exporting: false, error: null };
function msg(e: unknown, fb = 'Operation failed.'): string { if (e && typeof e === 'object') { const x = e as Record<string, unknown>; const o = x['error'] as Record<string, unknown> | undefined; if (o && typeof o['detail'] === 'string') return o['detail']; if (typeof x['message'] === 'string') return x['message']; } return fb; }

export const AuditLogsStore = signalStore(
  withState(init),
  withMethods((store, svc = inject(AuditLogsService)) => ({
    async load(): Promise<void> {
      patchState(store, { loading: true, error: null });
      try { const res = await firstValueFrom(svc.listAuditLogEntries(store.page(), store.size())); patchState(store, { items: res.content as AuditLogEntryDto[], totalElements: res.totalElements, loading: false }); }
      catch (e) { patchState(store, { loading: false, error: msg(e, 'Failed to load audit logs.') }); }
    },
    setPage(page: number, size: number) { patchState(store, { page, size }); },
    async requestExport(dto: AuditExportRequestDto): Promise<string | null> {
      patchState(store, { exporting: true, error: null });
      try { const r = await firstValueFrom(svc.requestAuditExport(dto)); patchState(store, { exporting: false }); return r.exportId ?? null; }
      catch (e) { patchState(store, { exporting: false, error: msg(e) }); return null; }
    },
    clearError() { patchState(store, { error: null }); },
  }))
);
