import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import {
  PermissionsService, PermissionDto, CreatePermissionRequestDto, PagedResponseDto
} from '@babakmirghafari/asms-api-client';

export interface PermissionsState {
  items: PermissionDto[];
  totalElements: number;
  pageIndex: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
}

export const PermissionsStore = signalStore(
  { providedIn: 'root' },
  withState<PermissionsState>({
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
    const svc = inject(PermissionsService);
    return {
      async loadAll(page = 0, size = 20, resource?: string): Promise<void> {
        patchState(store, { loading: true, error: null, pageIndex: page, pageSize: size });
        try {
          const res: PagedResponseDto = await firstValueFrom(svc.listPermissions(page, size, undefined, resource));
          patchState(store, { items: res.content as PermissionDto[], totalElements: res.totalElements, loading: false });
        } catch {
          patchState(store, { loading: false, error: 'COMMON.ERROR' });
        }
      },
      async create(dto: CreatePermissionRequestDto): Promise<PermissionDto> {
        patchState(store, { loading: true, error: null });
        try {
          const created = await firstValueFrom(svc.createPermission(dto));
          patchState(store, { items: [created, ...store.items()], totalElements: store.totalElements() + 1, loading: false });
          return created;
        } catch {
          patchState(store, { loading: false, error: 'COMMON.ERROR' });
          throw new Error('Create failed');
        }
      },
      async delete(id: string): Promise<void> {
        patchState(store, { loading: true, error: null });
        try {
          await firstValueFrom(svc.deletePermission(id));
          patchState(store, { items: store.items().filter(p => p.id !== id), totalElements: store.totalElements() - 1, loading: false });
        } catch {
          patchState(store, { loading: false, error: 'COMMON.ERROR' });
        }
      }
    };
  })
);
