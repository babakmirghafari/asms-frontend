import { computed, inject } from '@angular/core';
import { signalStore, withState, withComputed, withMethods, patchState } from '@ngrx/signals';
import { firstValueFrom } from 'rxjs';
import {
  UsersService, UserDto, CreateUserRequestDto, UpdateUserRequestDto
} from '@babakmirghafari/asms-api-client';
import { extractApiError } from '../../core/utils/api-error.util';

export interface UsersState {
  items: UserDto[];
  totalElements: number;
  pageIndex: number;
  pageSize: number;
  searchQuery: string;
  loading: boolean;
  error: string | null;
}

export const UsersStore = signalStore(
  { providedIn: 'root' },
  withState<UsersState>({
    items: [],
    totalElements: 0,
    pageIndex: 0,
    pageSize: 20,
    searchQuery: '',
    loading: false,
    error: null
  }),
  withComputed((store) => ({
    isLoading: computed(() => store.loading()),
    isEmpty: computed(() => store.items().length === 0 && !store.loading()),
    ownerById: computed(() => {
      const map: Record<string, UserDto> = {};
      for (const o of store.items()) { if (o.id) map[o.id] = o; }
      return map;
    })
  })),
  withMethods((store) => {
    const usersService = inject(UsersService);

    return {
      async loadAll(page = 0, size = 20, search?: string): Promise<void> {
        patchState(store, { loading: true, error: null, pageIndex: page, pageSize: size });
        try {
          const response = await firstValueFrom(
            usersService.listUsers(page, size, undefined, search)
          );
          patchState(store, {
            items: response.content as UserDto[],
            totalElements: response.totalElements,
            loading: false
          });
        } catch (err) {
          patchState(store, { loading: false, error: extractApiError(err) });
        }
      },

      async create(dto: CreateUserRequestDto): Promise<UserDto> {
        patchState(store, { loading: true, error: null });
        try {
          const created = await firstValueFrom(usersService.createUser(dto));
          patchState(store, {
            items: [created, ...store.items()],
            totalElements: store.totalElements() + 1,
            loading: false
          });
          return created;
        } catch (err) {
          const msg = extractApiError(err);
          patchState(store, { loading: false, error: msg });
          throw new Error(msg);
        }
      },

      async update(id: string, dto: UpdateUserRequestDto): Promise<void> {
        patchState(store, { loading: true, error: null });
        try {
          const updated = await firstValueFrom(usersService.updateUser(id, dto));
          patchState(store, {
            items: store.items().map(u => u.id === id ? updated : u),
            loading: false
          });
        } catch (err) {
          const msg = extractApiError(err);
          patchState(store, { loading: false, error: msg });
          throw new Error(msg);
        }
      },

      async delete(id: string): Promise<void> {
        patchState(store, { loading: true, error: null });
        try {
          await firstValueFrom(usersService.deleteUser(id));
          patchState(store, {
            items: store.items().filter(u => u.id !== id),
            totalElements: store.totalElements() - 1,
            loading: false
          });
        } catch (err) {
          const msg = extractApiError(err);
          patchState(store, { loading: false, error: msg });
          throw new Error(msg);
        }
      },

      setSearch(query: string): void {
        patchState(store, { searchQuery: query });
      }
    };
  })
);
