import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ActivityLogsService, ActivityLogDto } from '@babakmirghafari/asms-api-client';

interface ActivityLogsState { items: ActivityLogDto[]; totalElements: number; page: number; size: number; category: string; loading: boolean; error: string | null; }
const init: ActivityLogsState = { items: [], totalElements: 0, page: 0, size: 20, category: '', loading: false, error: null };
function msg(e: unknown, fb = 'Operation failed.'): string { if (e && typeof e === 'object') { const x = e as Record<string, unknown>; const o = x['error'] as Record<string, unknown> | undefined; if (o && typeof o['detail'] === 'string') return o['detail']; if (typeof x['message'] === 'string') return x['message']; } return fb; }

export const ActivityLogsStore = signalStore(
  withState(init),
  withMethods((store, svc = inject(ActivityLogsService)) => ({
    async load(orgId: string): Promise<void> {
      patchState(store, { loading: true, error: null });
      try {
        const res = await firstValueFrom(svc.listActivityLogs(orgId, store.page(), store.size(), undefined, store.category() as ActivityLogDto.CategoryEnum || undefined));
        patchState(store, { items: res.content as ActivityLogDto[], totalElements: res.totalElements, loading: false });
      } catch (e) { patchState(store, { loading: false, error: msg(e, 'Failed to load activity logs.') }); }
    },
    setPage(page: number, size: number) { patchState(store, { page, size }); },
    setCategory(v: string) { patchState(store, { category: v, page: 0 }); },
    clearError() { patchState(store, { error: null }); },
  }))
);
