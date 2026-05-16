import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { inject, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { OrganizationsService, OrganizationDto, CreateOrganizationRequestDto, UpdateOrganizationRequestDto } from '@babakmirghafari/asms-api-client';

type OrgStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

interface OrganizationsState { orgs: OrganizationDto[]; totalElements: number; page: number; size: number; statusFilter: string; loading: boolean; saving: boolean; error: string | null; }
const init: OrganizationsState = { orgs: [], totalElements: 0, page: 0, size: 20, statusFilter: '', loading: false, saving: false, error: null };
function msg(e: unknown, fb = 'Operation failed.'): string { if (e && typeof e === 'object') { const x = e as Record<string, unknown>; const o = x['error'] as Record<string, unknown> | undefined; if (o && typeof o['detail'] === 'string') return o['detail']; if (typeof x['message'] === 'string') return x['message']; } return fb; }

export const OrganizationsStore = signalStore(
  withState(init),
  withComputed((s) => ({ activeCount: computed(() => s.orgs().filter(o => o.status === 'ACTIVE').length) })),
  withMethods((store, svc = inject(OrganizationsService)) => ({
    async load(): Promise<void> {
      patchState(store, { loading: true, error: null });
      try {
        const st = store.statusFilter() as OrgStatus || undefined;
        const res = await firstValueFrom(svc.listOrganizations(store.page(), store.size(), st));
        patchState(store, { orgs: res.content as OrganizationDto[], totalElements: res.totalElements, loading: false });
      } catch (e) { patchState(store, { loading: false, error: msg(e, 'Failed to load organizations.') }); }
    },
    setStatusFilter(v: string) { patchState(store, { statusFilter: v, page: 0 }); },
    setPage(page: number, size: number) { patchState(store, { page, size }); },
    async create(dto: CreateOrganizationRequestDto): Promise<OrganizationDto | null> {
      patchState(store, { saving: true, error: null });
      try { const r = await firstValueFrom(svc.createOrganization(dto)); patchState(store, { saving: false }); return r; }
      catch (e) { patchState(store, { saving: false, error: msg(e) }); return null; }
    },
    async update(id: string, dto: UpdateOrganizationRequestDto): Promise<OrganizationDto | null> {
      patchState(store, { saving: true, error: null });
      try { const r = await firstValueFrom(svc.updateOrganization(id, dto)); patchState(store, { saving: false, orgs: store.orgs().map(o => o.id === id ? r : o) }); return r; }
      catch (e) { patchState(store, { saving: false, error: msg(e) }); return null; }
    },
    async remove(id: string): Promise<boolean> {
      patchState(store, { saving: true, error: null });
      try { await firstValueFrom(svc.deleteOrganization(id)); patchState(store, { saving: false, orgs: store.orgs().filter(o => o.id !== id), totalElements: store.totalElements() - 1 }); return true; }
      catch (e) { patchState(store, { saving: false, error: msg(e) }); return false; }
    },
    clearError() { patchState(store, { error: null }); },
  }))
);
