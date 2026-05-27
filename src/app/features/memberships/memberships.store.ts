import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import {
  MembershipsService, MembershipDto, CreateMembershipRequestDto, PagedResponseDto
} from '@babakmirghafari/asms-api-client';
import { extractApiError } from '../../core/utils/api-error.util';

export interface MembershipsState {
  items: MembershipDto[];
  totalElements: number;
  pageIndex: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
}

export const MembershipsStore = signalStore(
  { providedIn: 'root' },
  withState<MembershipsState>({
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
    const svc = inject(MembershipsService);
    return {
      async loadAll(page = 0, size = 20, userId?: string, organizationId?: string): Promise<void> {
        patchState(store, { loading: true, error: null, pageIndex: page, pageSize: size });
        try {
          const res: PagedResponseDto = await firstValueFrom(svc.listMemberships(page, size, userId, organizationId));
          patchState(store, { items: res.content as MembershipDto[], totalElements: res.totalElements, loading: false });
        } catch (err) {
          patchState(store, { loading: false, error: extractApiError(err) });
        }
      },
      async create(dto: CreateMembershipRequestDto): Promise<MembershipDto> {
        patchState(store, { loading: true, error: null });
        try {
          const created = await firstValueFrom(svc.createMembership(dto));
          patchState(store, { items: [created, ...store.items()], totalElements: store.totalElements() + 1, loading: false });
          return created;
        } catch (err) {
          const msg = extractApiError(err);
          patchState(store, { loading: false, error: msg });
          throw new Error(msg);
        }
      },
      async delete(id: string): Promise<void> {
        patchState(store, { loading: true, error: null });
        try {
          await firstValueFrom(svc.deleteMembership(id));
          patchState(store, { items: store.items().filter(m => m.id !== id), totalElements: store.totalElements() - 1, loading: false });
        } catch (err) {
          const msg = extractApiError(err);
          patchState(store, { loading: false, error: msg });
          throw new Error(msg);
        }
      }
    };
  })
);
