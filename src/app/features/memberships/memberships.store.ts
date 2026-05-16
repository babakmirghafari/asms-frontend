import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { MembershipsService, MembershipDto, CreateMembershipRequestDto } from '@babakmirghafari/asms-api-client';

interface MembershipsState { items: MembershipDto[]; totalElements: number; page: number; size: number; loading: boolean; saving: boolean; error: string | null; }
const init: MembershipsState = { items: [], totalElements: 0, page: 0, size: 20, loading: false, saving: false, error: null };
function msg(e: unknown, fb = 'Operation failed.'): string { if (e && typeof e === 'object') { const x = e as Record<string, unknown>; const o = x['error'] as Record<string, unknown> | undefined; if (o && typeof o['detail'] === 'string') return o['detail']; if (typeof x['message'] === 'string') return x['message']; } return fb; }

export const MembershipsStore = signalStore(
  withState(init),
  withMethods((store, svc = inject(MembershipsService)) => ({
    async load(page?: number, size?: number): Promise<void> {
      const p = page ?? store.page(); const s = size ?? store.size();
      patchState(store, { loading: true, error: null, page: p, size: s });
      try { const res = await firstValueFrom(svc.listMemberships(p, s)); patchState(store, { items: res.content as MembershipDto[], totalElements: res.totalElements, loading: false }); }
      catch (e) { patchState(store, { loading: false, error: msg(e, 'Failed to load memberships.') }); }
    },
    setPage(page: number, size: number) { patchState(store, { page, size }); },
    async create(dto: CreateMembershipRequestDto): Promise<MembershipDto | null> {
      patchState(store, { saving: true, error: null });
      try { const r = await firstValueFrom(svc.createMembership(dto)); patchState(store, { saving: false }); return r; }
      catch (e) { patchState(store, { saving: false, error: msg(e) }); return null; }
    },
    async remove(id: string): Promise<boolean> {
      patchState(store, { saving: true, error: null });
      try { await firstValueFrom(svc.deleteMembership(id)); patchState(store, { saving: false, items: store.items().filter(m => m.id !== id), totalElements: store.totalElements() - 1 }); return true; }
      catch (e) { patchState(store, { saving: false, error: msg(e) }); return false; }
    },
    clearError() { patchState(store, { error: null }); },
  }))
);
