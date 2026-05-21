import { signalStore, withState, withMethods } from '@ngrx/signals';

// TODO(angular-logic-implementer): implement real API calls using injected services from @babakmirghafari/asms-api-client

export interface StationPoliciesState {
  items: unknown[];
  loading: boolean;
  error: string | null;
}

export const StationPoliciesStore = signalStore(
  { providedIn: 'root' },
  withState<StationPoliciesState>({
    items: [],
    loading: false,
    error: null
  }),
  withMethods(() => ({
    // TODO(angular-logic-implementer): loadAll(), create(), update(), delete()
  }))
);
