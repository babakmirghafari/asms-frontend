import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./login/login.component').then(m => m.LoginComponent)
  },
  // TODO(angular-logic-implementer): add first-login, mfa, device, blocked, select-organization routes
];
