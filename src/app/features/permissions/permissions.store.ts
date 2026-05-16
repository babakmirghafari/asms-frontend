import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PermissionsService, PermissionDto, CreatePermissionRequestDto } from '@babakmirghafari/asms-api-client';

interface PermissionsState { items: PermissionDto[]; totalElements: number; page: number; size: number; loading: boolean; saving: boolean; error: string | null; }
const init: PermissionsState = { items: [], totalElements: 0, page: 0, size: 20, loading: false, saving: false, error: null };
function msg(e: unknown, fb = 'Operation failed.'): string { if (e && typeof e === 'object') { const x = e as Record<string, unknown>; const o = x['error'] as Record<string, unknown> | undefined; if (o && typeof o['detail'] === 'string') return o['detail']; if (typeof x['message'] === 'string') return x['message']; } return fb; }

export const PermissionsStore = signalStore(
  withState(init),
  withMethods((store, svc = inject(PermissionsService)) => ({
    async load(): Promise<void> {
      patchState(store, { loading: true, error: null });
      try { const res = await firstValueFrom(svc.listPermissions(store.page(), store.size())); patchState(store, { items: res.content as PermissionDto[], totalElements: res.totalElements, loading: false }); }
      catch (e) { patchState(store, { loading: false, error: msg(e, 'Failed to load permissions.') }); }
    },
    setPage(page: number, size: number) { patchState(store, { page, size }); },
    async create(dto: CreatePermissionRequestDto): Promise<PermissionDto | null> {
      patchState(store, { saving: true, error: null });
      try { const r = await firstValueFrom(svc.createPermission(dto)); patchState(store, { saving: false }); return r; }
      catch (e) { patchState(store, { saving: false, error: msg(e) }); return null; }
    },
    async remove(id: string): Promise<boolean> {
      patchState(store, { saving: true, error: null });
      try { await firstValueFrom(svc.deletePermission(id)); patchState(store, { saving: false, items: store.items().filter(i => i.id !== id), totalElements: store.totalElements() - 1 }); return true; }
      catch (e) { patchState(store, { saving: false, error: msg(e) }); return false; }
    },
    clearError() { patchState(store, { error: null }); },
  }))
);
