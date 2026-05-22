import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import {
  ApplicationsService, ApplicationDto, CreateApplicationRequestDto,
  UpdateApplicationRequestDto, PagedResponseDto
} from '@babakmirghafari/asms-api-client';

export interface ApplicationsState {
  items: ApplicationDto[];
  totalElements: number;
  pageIndex: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
}

export const ApplicationsStore = signalStore(
  { providedIn: 'root' },
  withState<ApplicationsState>({
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
    const svc = inject(ApplicationsService);
    return {
      async loadAll(page = 0, size = 20): Promise<void> {
        patchState(store, { loading: true, error: null, pageIndex: page, pageSize: size });
        try {
          const res: PagedResponseDto = await firstValueFrom(svc.listApplications(page, size));
          patchState(store, { items: res.content as ApplicationDto[], totalElements: res.totalElements, loading: false });
        } catch {
          patchState(store, { loading: false, error: 'COMMON.ERROR' });
        }
      },
      async create(dto: CreateApplicationRequestDto): Promise<ApplicationDto> {
        patchState(store, { loading: true, error: null });
        try {
          const created = await firstValueFrom(svc.createApplication(dto));
          patchState(store, { items: [created, ...store.items()], totalElements: store.totalElements() + 1, loading: false });
          return created;
        } catch {
          patchState(store, { loading: false, error: 'COMMON.ERROR' });
          throw new Error('Create failed');
        }
      },
      async update(id: string, dto: UpdateApplicationRequestDto): Promise<void> {
        patchState(store, { loading: true, error: null });
        try {
          const updated = await firstValueFrom(svc.updateApplication(id, dto));
          patchState(store, { items: store.items().map(a => a.id === id ? updated : a), loading: false });
        } catch {
          patchState(store, { loading: false, error: 'COMMON.ERROR' });
        }
      },
      async delete(id: string): Promise<void> {
        patchState(store, { loading: true, error: null });
        try {
          await firstValueFrom(svc.deleteApplication(id));
          patchState(store, { items: store.items().filter(a => a.id !== id), totalElements: store.totalElements() - 1, loading: false });
        } catch {
          patchState(store, { loading: false, error: 'COMMON.ERROR' });
        }
      }
    };
  })
);
