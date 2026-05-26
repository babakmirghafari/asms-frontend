import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { firstValueFrom, Observable } from 'rxjs';
import { OrganizationsService, OrganizationDto, OrganizationSettingsDto, CreateOrganizationRequestDto, UpdateOrganizationRequestDto, UpdateOrganizationSettingsRequestDto, PagedResponseDto } from '@babakmirghafari/asms-api-client';

export interface OrganizationsState {
  items: OrganizationDto[];
  settingsMap: Record<string, OrganizationSettingsDto>;
  totalElements: number;
  pageIndex: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
}

export const OrganizationsStore = signalStore(
  { providedIn: 'root' },
  withState<OrganizationsState>({ items: [], settingsMap: {}, totalElements: 0, pageIndex: 0, pageSize: 20, loading: false, error: null }),
  withComputed((store) => ({
    isLoading: computed(() => store.loading()),
    isEmpty: computed(() => store.items().length === 0 && !store.loading()),
    orgById: computed(() => {
      const map: Record<string, OrganizationDto> = {};
      for (const o of store.items()) { map[o.id!] = o; }
      return map;
    })
  })),
  withMethods((store) => {
    const svc = inject(OrganizationsService);
    return {
      async loadAll(page = 0, size = 20): Promise<void> {
        patchState(store, { loading: true, error: null, pageIndex: page, pageSize: size });
        try {
          const obs: Observable<PagedResponseDto> = svc.listOrganizations(page, size);
          const res = await firstValueFrom(obs);
          patchState(store, { items: res.content as OrganizationDto[], totalElements: res.totalElements, loading: false });
        } catch { patchState(store, { loading: false, error: 'COMMON.ERROR' }); }
      },
      async create(dto: CreateOrganizationRequestDto): Promise<OrganizationDto> {
        patchState(store, { loading: true, error: null });
        try {
          const obs: Observable<OrganizationDto> = svc.createOrganization(dto);
          const created = await firstValueFrom(obs);
          patchState(store, { items: [created, ...store.items()], totalElements: store.totalElements() + 1, loading: false });
          return created;
        } catch { patchState(store, { loading: false, error: 'COMMON.ERROR' }); throw new Error('Create failed'); }
      },
      async update(id: string, dto: UpdateOrganizationRequestDto): Promise<void> {
        patchState(store, { loading: true, error: null });
        try {
          const obs: Observable<OrganizationDto> = svc.updateOrganization(id, dto);
          const updated = await firstValueFrom(obs);
          patchState(store, { items: store.items().map(o => o.id === id ? updated : o), loading: false });
        } catch { patchState(store, { loading: false, error: 'COMMON.ERROR' }); }
      },
      async delete(id: string): Promise<void> {
        patchState(store, { loading: true, error: null });
        try {
          await firstValueFrom(svc.deleteOrganization(id));
          patchState(store, { items: store.items().filter(o => o.id !== id), totalElements: store.totalElements() - 1, loading: false });
        } catch { patchState(store, { loading: false, error: 'COMMON.ERROR' }); }
      },
      async loadSettings(orgId: string): Promise<OrganizationSettingsDto> {
        const obs: Observable<OrganizationSettingsDto> = svc.getOrganizationSettings(orgId);
        const settings = await firstValueFrom(obs);
        patchState(store, { settingsMap: { ...store.settingsMap(), [orgId]: settings } });
        return settings;
      },
      async saveSettings(orgId: string, dto: UpdateOrganizationSettingsRequestDto): Promise<OrganizationSettingsDto> {
        const obs: Observable<OrganizationSettingsDto> = svc.updateOrganizationSettings(orgId, dto);
        const updated = await firstValueFrom(obs);
        patchState(store, { settingsMap: { ...store.settingsMap(), [orgId]: updated } });
        return updated;
      }
    };
  })
);
