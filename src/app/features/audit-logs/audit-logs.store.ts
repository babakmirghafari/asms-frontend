import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import {
  AuditLogsService, AuditLogEntryDto, PagedResponseDto
} from '@babakmirghafari/asms-api-client';

export interface AuditLogsState {
  items: AuditLogEntryDto[];
  totalElements: number;
  pageIndex: number;
  pageSize: number;
  filterEventType: string;
  loading: boolean;
  error: string | null;
}

export const AuditLogsStore = signalStore(
  { providedIn: 'root' },
  withState<AuditLogsState>({
    items: [],
    totalElements: 0,
    pageIndex: 0,
    pageSize: 20,
    filterEventType: '',
    loading: false,
    error: null
  }),
  withComputed((store) => ({
    isLoading: computed(() => store.loading()),
    isEmpty: computed(() => store.items().length === 0 && !store.loading())
  })),
  withMethods((store) => {
    const svc = inject(AuditLogsService);
    return {
      async loadAll(page = 0, size = 20, eventType?: string, fromDate?: string, toDate?: string): Promise<void> {
        patchState(store, { loading: true, error: null, pageIndex: page, pageSize: size });
        try {
          const res: PagedResponseDto = await firstValueFrom(
            svc.listAuditLogEntries(page, size, undefined, undefined, eventType || undefined, fromDate, toDate)
          );
          patchState(store, { items: res.content as AuditLogEntryDto[], totalElements: res.totalElements, loading: false });
        } catch {
          patchState(store, { loading: false, error: 'COMMON.ERROR' });
        }
      },
      setEventTypeFilter(eventType: string): void {
        patchState(store, { filterEventType: eventType });
      }
    };
  })
);
