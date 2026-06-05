import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import {
  PermissionsService, PermissionDto, CreatePermissionRequestDto, PagedResponseDto,
  PermissionImportValidateResponseDto, PermissionImportCommitResponseDto
} from '@babakmirghafari/asms-api-client';
import { extractApiError } from '../../core/utils/api-error.util';

export interface PermissionsState {
  items: PermissionDto[];
  orgFilteredItems: PermissionDto[];
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
    orgFilteredItems: [],
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
          const res = await firstValueFrom(svc.listPermissions(page, size, undefined, undefined, resource)) as PagedResponseDto;
          patchState(store, { items: res.content as PermissionDto[], totalElements: res.totalElements, loading: false });
        } catch (err) {
          patchState(store, { loading: false, error: extractApiError(err) });
        }
      },

      async loadByOrganizationIds(organizationIds: string[], size = 100): Promise<void> {
        if (!organizationIds.length) {
          patchState(store, { orgFilteredItems: [] });
          return;
        }
        patchState(store, { loading: true, error: null });
        try {
          const res = await firstValueFrom(svc.listPermissions(0, size, undefined, organizationIds)) as PagedResponseDto;
          patchState(store, { orgFilteredItems: res.content as PermissionDto[], loading: false });
        } catch (err) {
          patchState(store, { loading: false, error: extractApiError(err) });
        }
      },

      async create(dto: CreatePermissionRequestDto): Promise<PermissionDto> {
        patchState(store, { loading: true, error: null });
        try {
          const created = await firstValueFrom(svc.createPermission(dto));
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
          await firstValueFrom(svc.deletePermission(id));
          patchState(store, { items: store.items().filter(p => p.id !== id), totalElements: store.totalElements() - 1, loading: false });
        } catch (err) {
          const msg = extractApiError(err);
          patchState(store, { loading: false, error: msg });
          throw new Error(msg);
        }
      },

      async validateImport(file: File, organizationId: string): Promise<PermissionImportValidateResponseDto> {
        const result = await firstValueFrom(svc.validatePermissionsImport(file, organizationId as any));
        return result as PermissionImportValidateResponseDto;
      },

      async commitImport(importId: string): Promise<PermissionImportCommitResponseDto> {
        const result = await firstValueFrom(svc.commitPermissionsImport({ importId: importId as any }));
        return result as PermissionImportCommitResponseDto;
      },

      async exportAll(filters: { resource?: string; organizationId?: string; status?: string }): Promise<Blob> {
        const result = await firstValueFrom(
          (svc as any).exportPermissions(
            filters.organizationId,
            undefined,
            filters.status,
            filters.resource
          )
        );
        return result as unknown as Blob;
      }
    };
  })
);
