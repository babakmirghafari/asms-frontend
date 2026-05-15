import { signalStore, withState, withMethods, withComputed, patchState } from '@ngrx/signals';
import { computed } from '@angular/core';

interface ApplicationsState {
  items: unknown[];
  selectedId: string | null;
  loading: boolean;
  error: string | null;
}

const initialApplicationsState: ApplicationsState = {
  items: [],
  selectedId: null,
  loading: false,
  error: null,
};

export const ApplicationsStore = signalStore(
  withState(initialApplicationsState),
  withComputed((store) => ({
    selected: computed(() =>
      // TODO(angular-logic-implementer): replace unknown[] with generated Dto type
      (store.items() as ({ id: string })[]).find(item => item.id === store.selectedId()) ?? null
    ),
  })),
  withMethods((store) => ({
    // TODO(angular-logic-implementer): inject generated ApplicationsService and implement real API calls
    async load(): Promise<void> {
      patchState(store, { loading: true, error: null });
      // TODO(angular-logic-implementer): call service.listApplicationss() and patchState with response
      patchState(store, { loading: false });
    },
  }))
);
