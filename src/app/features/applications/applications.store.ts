import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApplicationsService, ApplicationDto, CreateApplicationRequestDto, UpdateApplicationRequestDto } from '@babakmirghafari/asms-api-client';

interface AppsState { items: ApplicationDto[]; totalElements: number; page: number; size: number; loading: boolean; saving: boolean; error: string | null; }
const init: AppsState = { items: [], totalElements: 0, page: 0, size: 20, loading: false, saving: false, error: null };
function msg(e: unknown, fb = 'Operation failed.'): string { if (e && typeof e === 'object') { const x = e as Record<string, unknown>; const o = x['error'] as Record<string, unknown> | undefined; if (o && typeof o['detail'] === 'string') return o['detail']; if (typeof x['message'] === 'string') return x['message']; } return fb; }

export const ApplicationsStore = signalStore(
  withState(init),
  withMethods((store, svc = inject(ApplicationsService)) => ({
    async load(): Promise<void> {
      patchState(store, { loading: true, error: null });
      try { const res = await firstValueFrom(svc.listApplications(store.page(), store.size())); patchState(store, { items: res.content as ApplicationDto[], totalElements: res.totalElements, loading: false }); }
      catch (e) { patchState(store, { loading: false, error: msg(e, 'Failed to load applications.') }); }
    },
    setPage(page: number, size: number) { patchState(store, { page, size }); },
    async create(dto: CreateApplicationRequestDto): Promise<ApplicationDto | null> {
      patchState(store, { saving: true, error: null });
      try { const r = await firstValueFrom(svc.createApplication(dto)); patchState(store, { saving: false }); return r; }
      catch (e) { patchState(store, { saving: false, error: msg(e) }); return null; }
    },
    async update(id: string, dto: UpdateApplicationRequestDto): Promise<ApplicationDto | null> {
      patchState(store, { saving: true, error: null });
      try { const r = await firstValueFrom(svc.updateApplication(id, dto)); patchState(store, { saving: false, items: store.items().map(i => i.id === id ? r : i) }); return r; }
      catch (e) { patchState(store, { saving: false, error: msg(e) }); return null; }
    },
    async remove(id: string): Promise<boolean> {
      patchState(store, { saving: true, error: null });
      try { await firstValueFrom(svc.deleteApplication(id)); patchState(store, { saving: false, items: store.items().filter(i => i.id !== id), totalElements: store.totalElements() - 1 }); return true; }
      catch (e) { patchState(store, { saving: false, error: msg(e) }); return false; }
    },
    clearError() { patchState(store, { error: null }); },
  }))
);
