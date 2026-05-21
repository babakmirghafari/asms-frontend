import { signalStore, withState, withMethods } from '@ngrx/signals';

// TODO(angular-logic-implementer): implement real API calls using injected services from @babakmirghafari/asms-api-client

export interface AccessControlState {
  items: unknown[];
  loading: boolean;
  error: string | null;
}

export const AccessControlStore = signalStore(
  { providedIn: 'root' },
  withState<AccessControlState>({
    items: [],
    loading: false,
    error: null
  }),
  withMethods(() => ({
    // TODO(angular-logic-implementer): loadAll(), create(), update(), delete()
  }))
);
