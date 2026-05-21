import { signalStore, withState, withMethods } from '@ngrx/signals';

// TODO(angular-logic-implementer): implement login, MFA verify, org-select, first-login, change-password API calls

export interface AuthFeatureState {
  loading: boolean;
  error: string | null;
}

export const AuthFeatureStore = signalStore(
  { providedIn: 'root' },
  withState<AuthFeatureState>({
    loading: false,
    error: null
  }),
  withMethods(() => ({
    // TODO(angular-logic-implementer): login(), verifyMfa(), selectOrg(), changePassword()
  }))
);
