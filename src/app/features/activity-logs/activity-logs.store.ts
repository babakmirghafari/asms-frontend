import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import {
  ActivityLogsService, ActivityLogDto, PagedResponseDto
} from '@babakmirghafari/asms-api-client';
import { AuthStore } from '../../core/store/auth.store';

export interface ActivityLogsState {
  items: ActivityLogDto[];
  totalElements: number;
  pageIndex: number;
  pageSize: number;
  filterCategory: string;
  loading: boolean;
  error: string | null;
}

export const ActivityLogsStore = signalStore(
  { providedIn: 'root' },
  withState<ActivityLogsState>({
    items: [],
    totalElements: 0,
    pageIndex: 0,
    pageSize: 20,
    filterCategory: '',
    loading: false,
    error: null
  }),
  withComputed((store) => ({
    isLoading: computed(() => store.loading()),
    isEmpty: computed(() => store.items().length === 0 && !store.loading())
  })),
  withMethods((store) => {
    const svc = inject(ActivityLogsService);
    const authStore = inject(AuthStore);
    return {
      async loadAll(
        page = 0,
        size = 20,
        category?: 'AUTHENTICATION' | 'AUTHORIZATION' | 'USER_MANAGEMENT' | 'PERMISSION_CHANGE' | 'SESSION' | 'APPLICATION',
        fromDate?: string,
        toDate?: string
      ): Promise<void> {
        const orgId = authStore.organizationId();
        if (!orgId) {
          patchState(store, { loading: false });
          return;
        }
        patchState(store, { loading: true, error: null, pageIndex: page, pageSize: size });
        try {
          const res: PagedResponseDto = await firstValueFrom(
            svc.listActivityLogs(orgId, page, size, undefined, category, fromDate, toDate)
          );
          patchState(store, { items: res.content as ActivityLogDto[], totalElements: res.totalElements, loading: false });
        } catch {
          patchState(store, { loading: false, error: 'COMMON.ERROR' });
        }
      },
      setCategoryFilter(category: string): void {
        patchState(store, { filterCategory: category });
      }
    };
  })
);
