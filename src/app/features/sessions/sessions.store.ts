import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { SessionsService, SessionDto, RevokeSessionRequestDto } from '@babakmirghafari/asms-api-client';

interface SessionsState { items: SessionDto[]; totalElements: number; page: number; size: number; loading: boolean; saving: boolean; error: string | null; }
const init: SessionsState = { items: [], totalElements: 0, page: 0, size: 20, loading: false, saving: false, error: null };
function msg(e: unknown, fb = 'Operation failed.'): string { if (e && typeof e === 'object') { const x = e as Record<string, unknown>; const o = x['error'] as Record<string, unknown> | undefined; if (o && typeof o['detail'] === 'string') return o['detail']; if (typeof x['message'] === 'string') return x['message']; } return fb; }

export const SessionsStore = signalStore(
  withState(init),
  withMethods((store, svc = inject(SessionsService)) => ({
    async load(): Promise<void> {
      patchState(store, { loading: true, error: null });
      try { const res = await firstValueFrom(svc.listSessions(store.page(), store.size())); patchState(store, { items: res.content as SessionDto[], totalElements: res.totalElements, loading: false }); }
      catch (e) { patchState(store, { loading: false, error: msg(e, 'Failed to load sessions.') }); }
    },
    setPage(page: number, size: number) { patchState(store, { page, size }); },
    async revoke(sessionId: string, dto: RevokeSessionRequestDto): Promise<boolean> {
      patchState(store, { saving: true, error: null });
      try { await firstValueFrom(svc.revokeSession(sessionId, dto)); patchState(store, { saving: false, items: store.items().map(s => s.id === sessionId ? {...s, status: 'REVOKED'} : s) }); return true; }
      catch (e) { patchState(store, { saving: false, error: msg(e) }); return false; }
    },
    clearError() { patchState(store, { error: null }); },
  }))
);
