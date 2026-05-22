import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import {
  SessionsService, SessionDto, PagedResponseDto
} from '@babakmirghafari/asms-api-client';

export interface SessionsState {
  items: SessionDto[];
  totalElements: number;
  pageIndex: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
}

export const SessionsStore = signalStore(
  { providedIn: 'root' },
  withState<SessionsState>({
    items: [],
    totalElements: 0,
    pageIndex: 0,
    pageSize: 20,
    loading: false,
    error: null
  }),
  withComputed((store) => ({
    isLoading: computed(() => store.loading()),
    isEmpty: computed(() => store.items().length === 0 && !store.loading())
  })),
  withMethods((store) => {
    const svc = inject(SessionsService);
    return {
      async loadAll(page = 0, size = 20, status?: 'ACTIVE' | 'REVOKED' | 'EXPIRED'): Promise<void> {
        patchState(store, { loading: true, error: null, pageIndex: page, pageSize: size });
        try {
          const res: PagedResponseDto = await firstValueFrom(svc.listSessions(page, size, undefined, undefined, status));
          patchState(store, { items: res.content as SessionDto[], totalElements: res.totalElements, loading: false });
        } catch {
          patchState(store, { loading: false, error: 'COMMON.ERROR' });
        }
      },
      async revoke(sessionId: string): Promise<void> {
        patchState(store, { loading: true, error: null });
        try {
          const updated = await firstValueFrom(svc.revokeSession(sessionId, { reason: 'Admin revoke' }));
          patchState(store, { items: store.items().map(s => s.id === sessionId ? updated : s), loading: false });
        } catch {
          patchState(store, { loading: false, error: 'COMMON.ERROR' });
        }
      },
      async revokeAll(organizationId: string): Promise<void> {
        patchState(store, { loading: true, error: null });
        try {
          await firstValueFrom(svc.revokeAllSessions({ organizationId, reason: 'Admin bulk revoke' }));
          patchState(store, {
            items: store.items().map(s => ({ ...s, status: SessionDto.StatusEnum.Revoked })),
            loading: false
          });
        } catch {
          patchState(store, { loading: false, error: 'COMMON.ERROR' });
        }
      }
    };
  })
);
