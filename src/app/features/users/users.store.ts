import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { inject, computed } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import {
  UsersService, UserDto, CreateUserRequestDto, UpdateUserRequestDto, UserStatusUpdateRequestDto
} from '@babakmirghafari/asms-api-client';

interface UsersState {
  users: UserDto[];
  totalElements: number;
  page: number;
  size: number;
  search: string;
  statusFilter: string;
  loading: boolean;
  saving: boolean;
  error: string | null;
  selectedUser: UserDto | null;
}

const initialState: UsersState = {
  users: [],
  totalElements: 0,
  page: 0,
  size: 20,
  search: '',
  statusFilter: '',
  loading: false,
  saving: false,
  error: null,
  selectedUser: null,
};

function extractMessage(err: unknown, fallback = 'Operation failed.'): string {
  if (err && typeof err === 'object') {
    const e = err as Record<string, unknown>;
    const errObj = e['error'] as Record<string, unknown> | undefined;
    if (errObj && typeof errObj['detail'] === 'string') return errObj['detail'];
    if (typeof e['message'] === 'string') return e['message'];
  }
  return fallback;
}

export const UsersStore = signalStore(
  withState(initialState),
  withComputed((store) => ({
    activeCount: computed(() => store.users().filter(u => u.status === 'ACTIVE').length),
    lockedCount: computed(() => store.users().filter(u => u.status === 'LOCKED').length),
  })),
  withMethods((store, svc = inject(UsersService)) => ({
    async loadUsers(): Promise<void> {
      patchState(store, { loading: true, error: null });
      try {
        const status = store.statusFilter() as UserDto.StatusEnum | undefined;
        const res = await firstValueFrom(svc.listUsers(
          store.page(), store.size(),
          status || undefined,
          store.search() || undefined
        ));
        patchState(store, {
          users: (res.content as UserDto[]),
          totalElements: res.totalElements,
          loading: false,
        });
      } catch (err: unknown) {
        patchState(store, { loading: false, error: extractMessage(err, 'Failed to load users.') });
      }
    },

    setSearch(search: string): void {
      patchState(store, { search, page: 0 });
    },

    setStatusFilter(statusFilter: string): void {
      patchState(store, { statusFilter, page: 0 });
    },

    setPage(page: number, size: number): void {
      patchState(store, { page, size });
    },

    selectUser(user: UserDto | null): void {
      patchState(store, { selectedUser: user });
    },

    async createUser(dto: CreateUserRequestDto): Promise<UserDto | null> {
      patchState(store, { saving: true, error: null });
      try {
        const user = await firstValueFrom(svc.createUser(dto));
        patchState(store, { saving: false });
        return user;
      } catch (err: unknown) {
        patchState(store, { saving: false, error: extractMessage(err, 'Failed to create user.') });
        return null;
      }
    },

    async updateUser(userId: string, dto: UpdateUserRequestDto): Promise<UserDto | null> {
      patchState(store, { saving: true, error: null });
      try {
        const user = await firstValueFrom(svc.updateUser(userId, dto));
        patchState(store, {
          saving: false,
          users: store.users().map(u => u.id === userId ? user : u),
        });
        return user;
      } catch (err: unknown) {
        patchState(store, { saving: false, error: extractMessage(err, 'Failed to update user.') });
        return null;
      }
    },

    async updateStatus(userId: string, dto: UserStatusUpdateRequestDto): Promise<boolean> {
      patchState(store, { saving: true, error: null });
      try {
        const user = await firstValueFrom(svc.updateUserStatus(userId, dto));
        patchState(store, {
          saving: false,
          users: store.users().map(u => u.id === userId ? user : u),
        });
        return true;
      } catch (err: unknown) {
        patchState(store, { saving: false, error: extractMessage(err, 'Failed to update status.') });
        return false;
      }
    },

    async deleteUser(userId: string): Promise<boolean> {
      patchState(store, { saving: true, error: null });
      try {
        await firstValueFrom(svc.deleteUser(userId));
        patchState(store, {
          saving: false,
          users: store.users().filter(u => u.id !== userId),
          totalElements: store.totalElements() - 1,
        });
        return true;
      } catch (err: unknown) {
        patchState(store, { saving: false, error: extractMessage(err, 'Failed to delete user.') });
        return false;
      }
    },

    clearError(): void {
      patchState(store, { error: null });
    },
  }))
);
