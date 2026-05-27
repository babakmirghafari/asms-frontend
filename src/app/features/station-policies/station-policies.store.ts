import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import {
  StationPoliciesService, StationPolicyDto, CreateStationPolicyRequestDto,
  UpdateStationPolicyRequestDto, PagedResponseDto
} from '@babakmirghafari/asms-api-client';
import { extractApiError } from '../../core/utils/api-error.util';

export interface StationPoliciesState {
  items: StationPolicyDto[];
  totalElements: number;
  pageIndex: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
}

export const StationPoliciesStore = signalStore(
  { providedIn: 'root' },
  withState<StationPoliciesState>({
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
    const svc = inject(StationPoliciesService);
    return {
      async loadAll(page = 0, size = 20): Promise<void> {
        patchState(store, { loading: true, error: null, pageIndex: page, pageSize: size });
        try {
          const res: PagedResponseDto = await firstValueFrom(svc.listStationPolicies(page, size));
          patchState(store, { items: res.content as StationPolicyDto[], totalElements: res.totalElements, loading: false });
        } catch (err) {
          patchState(store, { loading: false, error: extractApiError(err) });
        }
      },
      async create(dto: CreateStationPolicyRequestDto): Promise<StationPolicyDto> {
        patchState(store, { loading: true, error: null });
        try {
          const created = await firstValueFrom(svc.createStationPolicy(dto));
          patchState(store, { items: [created, ...store.items()], totalElements: store.totalElements() + 1, loading: false });
          return created;
        } catch (err) {
          const msg = extractApiError(err);
          patchState(store, { loading: false, error: msg });
          throw new Error(msg);
        }
      },
      async update(id: string, dto: UpdateStationPolicyRequestDto): Promise<void> {
        patchState(store, { loading: true, error: null });
        try {
          const updated = await firstValueFrom(svc.updateStationPolicy(id, dto));
          patchState(store, { items: store.items().map(p => p.id === id ? updated : p), loading: false });
        } catch (err) {
          const msg = extractApiError(err);
          patchState(store, { loading: false, error: msg });
          throw new Error(msg);
        }
      },
      async delete(id: string): Promise<void> {
        patchState(store, { loading: true, error: null });
        try {
          await firstValueFrom(svc.deleteStationPolicy(id));
          patchState(store, { items: store.items().filter(p => p.id !== id), totalElements: store.totalElements() - 1, loading: false });
        } catch (err) {
          const msg = extractApiError(err);
          patchState(store, { loading: false, error: msg });
          throw new Error(msg);
        }
      }
    };
  })
);
