import { signalStore, withState, withMethods } from '@ngrx/signals';

// TODO(angular-logic-implementer): implement real API calls using injected services from @babakmirghafari/asms-api-client

export interface AlertsState {
  items: unknown[];
  loading: boolean;
  error: string | null;
}

export const AlertsStore = signalStore(
  { providedIn: 'root' },
  withState<AlertsState>({
    items: [],
    loading: false,
    error: null
  }),
  withMethods(() => ({
    // TODO(angular-logic-implementer): loadAll(), create(), update(), delete()
  }))
);
